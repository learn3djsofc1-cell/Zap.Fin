import {
  startRailgunEngine,
  stopRailgunEngine,
  hasEngine,
  setArtifactStore,
  ArtifactStore,
  loadProvider,
  getFallbackProviderForNetwork,
} from '@railgun-community/wallet';
import {
  NetworkName,
  NETWORK_CONFIG,
} from '@railgun-community/shared-models';
import fs from 'fs';
import path from 'path';
import { getRpcConfig, SUPPORTED_NETWORKS } from './provider.js';
import pool from '../db.js';

const DB_PATH = path.resolve(process.cwd(), '.railgun-db');
const ARTIFACTS_PATH = path.resolve(process.cwd(), '.railgun-artifacts');

let engineInitialized = false;

function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
  }
}

function createFileArtifactStore(): ArtifactStore {
  return new ArtifactStore(
    async (filePath: string) => {
      const fullPath = path.join(ARTIFACTS_PATH, filePath);
      if (!fs.existsSync(fullPath)) return undefined;
      const data = fs.readFileSync(fullPath);
      return [data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)];
    },
    async (dir: string, filePath: string, item: string | Buffer | ArrayBuffer) => {
      const fullDir = path.join(ARTIFACTS_PATH, dir);
      ensureDirectory(fullDir);
      const fullPath = path.join(ARTIFACTS_PATH, filePath);
      let buffer: Buffer;
      if (typeof item === 'string') {
        buffer = Buffer.from(item, 'utf8');
      } else if (item instanceof ArrayBuffer) {
        buffer = Buffer.from(item);
      } else {
        buffer = item;
      }
      fs.writeFileSync(fullPath, buffer);
    },
    async (filePath: string) => {
      const fullPath = path.join(ARTIFACTS_PATH, filePath);
      return fs.existsSync(fullPath);
    },
  );
}

interface LevelDBAdapter {
  get: (namespace: string[], key: string) => Promise<string | undefined>;
  put: (namespace: string[], key: string, value: string) => Promise<void>;
  del: (namespace: string[], key: string) => Promise<void>;
  batch: (ops: Array<{ type: 'put' | 'del'; namespace: string[]; key: string; value?: string }>) => Promise<void>;
}

async function createLevelDatabase(): Promise<LevelDBAdapter> {
  ensureDirectory(DB_PATH);
  const levelModule = await import('level');
  const Level = levelModule.Level;
  const db = new Level(DB_PATH);

  return {
    get: async (namespace: string[], key: string): Promise<string | undefined> => {
      const fullKey = [...namespace, key].join(':');
      try {
        return await db.get(fullKey);
      } catch (err: unknown) {
        const levelErr = err as { code?: string; notFound?: boolean };
        if (levelErr.code === 'LEVEL_NOT_FOUND' || levelErr.notFound) return undefined;
        throw err;
      }
    },
    put: async (namespace: string[], key: string, value: string): Promise<void> => {
      const fullKey = [...namespace, key].join(':');
      await db.put(fullKey, value);
    },
    del: async (namespace: string[], key: string): Promise<void> => {
      const fullKey = [...namespace, key].join(':');
      try {
        await db.del(fullKey);
      } catch (err: unknown) {
        const levelErr = err as { code?: string; notFound?: boolean };
        if (levelErr.code === 'LEVEL_NOT_FOUND' || levelErr.notFound) return;
        throw err;
      }
    },
    batch: async (ops: Array<{ type: 'put' | 'del'; namespace: string[]; key: string; value?: string }>) => {
      const batch = db.batch();
      for (const op of ops) {
        const fullKey = [...op.namespace, op.key].join(':');
        if (op.type === 'put') {
          batch.put(fullKey, op.value!);
        } else {
          batch.del(fullKey);
        }
      }
      await batch.write();
    },
  };
}

export async function initializeRailgunEngine(): Promise<void> {
  if (engineInitialized || hasEngine()) {
    console.log('[Railgun] Engine already initialized');
    return;
  }

  console.log('[Railgun] Initializing engine...');
  ensureDirectory(DB_PATH);
  ensureDirectory(ARTIFACTS_PATH);

  const db = await createLevelDatabase();
  const artifactStore = createFileArtifactStore();
  setArtifactStore(artifactStore);

  const poiNodeURLs: string[] = [
    'https://poi-node.railgun.org',
  ];

  await startRailgunEngine(
    'noctra-ai',
    db,
    false,
    artifactStore,
    false,
    false,
    poiNodeURLs,
    undefined,
    false,
  );

  engineInitialized = true;
  console.log('[Railgun] Engine initialized successfully');

  await loadNetworkProviders();
  await recoverPendingOperations();
}

async function loadNetworkProviders(): Promise<void> {
  const rpcConfig = getRpcConfig();

  for (const network of SUPPORTED_NETWORKS) {
    const rpcUrl = rpcConfig[network.id];
    if (!rpcUrl) {
      console.warn(`[Railgun] No RPC URL configured for ${network.name} — skipping`);
      continue;
    }

    try {
      const fallbackProviderConfig = {
        chainId: network.chainId,
        providers: [
          {
            provider: rpcUrl,
            priority: 1,
            weight: 1,
            maxLogsPerBatch: 1,
            stallTimeout: 2500,
          },
        ],
      };

      await loadProvider(fallbackProviderConfig, network.networkName, 15000);
      console.log(`[Railgun] Loaded provider for ${network.name} (chainId: ${network.chainId})`);
    } catch (err) {
      console.error(`[Railgun] Failed to load provider for ${network.name}:`, err);
    }
  }
}

async function recoverPendingOperations(): Promise<void> {
  try {
    const staleResult = await pool.query(
      `UPDATE railgun_operations SET status = 'failed'
       WHERE status IN ('pending', 'proving') AND created_at < NOW() - INTERVAL '10 minutes'
       RETURNING id`
    );
    if (staleResult.rowCount && staleResult.rowCount > 0) {
      console.log(`[Railgun] Recovered ${staleResult.rowCount} stale operations → failed`);
    }

    const confirmedResult = await pool.query<{ id: string; tx_hash: string; network: string }>(
      `SELECT id, tx_hash, network FROM railgun_operations WHERE status = 'confirmed' AND tx_hash IS NOT NULL`
    );
    if (confirmedResult.rows.length > 0) {
      console.log(`[Railgun] Verifying ${confirmedResult.rows.length} confirmed operations on-chain...`);
      for (const row of confirmedResult.rows) {
        await verifyOperationOnChain(row.id, row.tx_hash, row.network);
      }
    }
  } catch (err) {
    console.error('[Railgun] Operation recovery error:', err);
  }
}

async function verifyOperationOnChain(opId: string, txHash: string, networkId: string): Promise<void> {
  try {
    const net = SUPPORTED_NETWORKS.find(n => n.id === networkId);
    if (!net) {
      console.warn(`[Railgun] Unknown network ${networkId} for op ${opId}, leaving confirmed`);
      return;
    }

    const provider = getFallbackProviderForNetwork(net.networkName);
    if (!provider) {
      console.warn(`[Railgun] No provider for ${net.name}, cannot verify op ${opId}`);
      return;
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      console.log(`[Railgun] Op ${opId}: tx ${txHash} not found on-chain yet, leaving confirmed`);
      return;
    }

    if (receipt.status === 1) {
      await pool.query(
        `UPDATE railgun_operations SET status = 'complete', completed_at = NOW() WHERE id = $1`,
        [opId]
      );
      console.log(`[Railgun] Op ${opId}: verified complete on-chain`);
    } else {
      await pool.query(
        `UPDATE railgun_operations SET status = 'failed' WHERE id = $1`,
        [opId]
      );
      console.log(`[Railgun] Op ${opId}: tx reverted on-chain`);
    }
  } catch (err) {
    console.error(`[Railgun] On-chain verification failed for op ${opId}:`, err);
  }
}

let statusWorkerInterval: ReturnType<typeof setInterval> | null = null;

export function startStatusWorker(): void {
  if (statusWorkerInterval) return;

  statusWorkerInterval = setInterval(async () => {
    if (!engineInitialized) return;

    try {
      const confirmedOps = await pool.query<{ id: string; tx_hash: string; network: string }>(
        `SELECT id, tx_hash, network FROM railgun_operations
         WHERE status = 'confirmed' AND tx_hash IS NOT NULL
         AND created_at > NOW() - INTERVAL '24 hours'`
      );

      for (const row of confirmedOps.rows) {
        await verifyOperationOnChain(row.id, row.tx_hash, row.network);
      }

      await pool.query(
        `UPDATE railgun_operations SET status = 'failed'
         WHERE status IN ('pending', 'proving')
         AND created_at < NOW() - INTERVAL '15 minutes'`
      );
    } catch (err) {
      console.error('[Railgun] Status worker error:', err);
    }
  }, 60000);

  console.log('[Railgun] Status worker started (60s interval)');
}

export function stopStatusWorker(): void {
  if (statusWorkerInterval) {
    clearInterval(statusWorkerInterval);
    statusWorkerInterval = null;
  }
}

export async function shutdownRailgunEngine(): Promise<void> {
  stopStatusWorker();
  if (engineInitialized) {
    await stopRailgunEngine();
    engineInitialized = false;
    console.log('[Railgun] Engine shut down');
  }
}

export function isEngineReady(): boolean {
  return engineInitialized && hasEngine();
}
