import {
  startRailgunEngine,
  stopRailgunEngine,
  hasEngine,
  setArtifactStore,
  ArtifactStore,
  loadProvider,
} from '@railgun-community/wallet';
import {
  NetworkName,
  NETWORK_CONFIG,
} from '@railgun-community/shared-models';
import fs from 'fs';
import path from 'path';
import { getRpcConfig, SUPPORTED_NETWORKS } from './provider.js';

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

function createLevelDatabase() {
  ensureDirectory(DB_PATH);
  const Level = require('level').Level;
  const db = new Level(DB_PATH);

  return {
    get: async (namespace: string[], key: string): Promise<string | undefined> => {
      const fullKey = [...namespace, key].join(':');
      try {
        return await db.get(fullKey);
      } catch (err: any) {
        if (err.code === 'LEVEL_NOT_FOUND' || err.notFound) return undefined;
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
      } catch (err: any) {
        if (err.code === 'LEVEL_NOT_FOUND' || err.notFound) return;
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

  const db = createLevelDatabase();
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

export async function shutdownRailgunEngine(): Promise<void> {
  if (engineInitialized) {
    await stopRailgunEngine();
    engineInitialized = false;
    console.log('[Railgun] Engine shut down');
  }
}

export function isEngineReady(): boolean {
  return engineInitialized && hasEngine();
}
