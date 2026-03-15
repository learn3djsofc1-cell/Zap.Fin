import { Wallet } from 'lucide-react';

export default function TopupsPage() {
  return (
    <div className="max-w-5xl mx-auto pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Top-up Balance</h1>
      </div>

      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-[#111215] border border-white/5 flex items-center justify-center mb-6">
          <Wallet size={36} className="text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Create a Solana Wallet</h2>
        <p className="text-gray-400 text-sm text-center max-w-md mb-8">
          You need a Solana wallet to top up your balance. Create one to get started with deposits and conversions.
        </p>
        <button className="bg-[#FF6940] hover:bg-[#E55E39] text-black py-3 px-8 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-[#FF6940]/20">
          <Wallet size={18} />
          Create Solana Wallet
        </button>
      </div>
    </div>
  );
}
