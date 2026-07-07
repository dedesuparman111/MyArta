const fs = require('fs');

const content = `import React, { useState } from 'react';
import { Asset } from '../types';
import { apiService } from '../lib/supabase';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Briefcase, Bitcoin, BarChart3, Coins, X, RefreshCw, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface AssetsProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => Promise<boolean>;
  onUpdateAsset: (id: string, updates: Partial<Asset>) => Promise<boolean>;
  onDeleteAsset: (id: string) => Promise<boolean>;
}

export const Assets: React.FC<AssetsProps> = ({ assets, onAddAsset, onUpdateAsset, onDeleteAsset }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  
  // Transaction states (deposit/withdraw)
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [transactionAsset, setTransactionAsset] = useState<Asset | null>(null);
  const [txQuantity, setTxQuantity] = useState('');
  const [txPrice, setTxPrice] = useState('');

  const [name, setName] = useState('');
  const [type, setType] = useState<'Kripto' | 'Saham' | 'Reksadana' | 'Emas' | 'Lainnya'>('Kripto');
  const [platform, setPlatform] = useState('');
  const [quantity, setQuantity] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const resetForm = () => {
    setShowAddForm(false);
    setEditingAsset(null);
    setName('');
    setType('Kripto');
    setPlatform('');
    setQuantity('');
    setAveragePrice('');
    setCurrentPrice('');
  };

  const resetTxForm = () => {
    setShowTransactionForm(false);
    setTransactionAsset(null);
    setTxQuantity('');
    setTxPrice('');
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setName(asset.name);
    setType(asset.type);
    setPlatform(asset.platform);
    setQuantity(asset.quantity.toString());
    setAveragePrice(asset.average_price.toString());
    setCurrentPrice(asset.current_price.toString());
    setShowAddForm(true);
  };

  const openTransactionForm = (asset: Asset, tType: 'deposit' | 'withdraw') => {
    setTransactionAsset(asset);
    setTransactionType(tType);
    setTxQuantity('');
    setTxPrice(asset.current_price.toString());
    setShowTransactionForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const avgPrice = parseFloat(averagePrice);
    
    if (editingAsset) {
      await onUpdateAsset(editingAsset.id, {
        name,
        type,
        platform,
        quantity: qty,
        average_price: avgPrice,
        current_price: parseFloat(currentPrice),
      });
    } else {
      await onAddAsset({
        name,
        type,
        platform,
        quantity: qty,
        average_price: avgPrice,
        current_price: parseFloat(currentPrice),
        total_deposit: qty * avgPrice,
        total_withdraw: 0,
      });
    }
    resetForm();
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionAsset) return;

    const qty = parseFloat(txQuantity);
    const price = parseFloat(txPrice);
    if (qty <= 0 || price <= 0) return;

    const oldQty = transactionAsset.quantity;
    const oldAvg = transactionAsset.average_price;
    const oldDeposit = transactionAsset.total_deposit ?? (oldQty * oldAvg);
    const oldWithdraw = transactionAsset.total_withdraw ?? 0;

    let newUpdates: Partial<Asset> = {};

    if (transactionType === 'deposit') {
      const newQty = oldQty + qty;
      const newAvg = ((oldQty * oldAvg) + (qty * price)) / newQty;
      newUpdates = {
        quantity: newQty,
        average_price: newAvg,
        current_price: price,
        total_deposit: oldDeposit + (qty * price)
      };
    } else {
      if (qty > oldQty) {
        alert('Jumlah withdraw tidak boleh melebihi saldo aset.');
        return;
      }
      const newQty = oldQty - qty;
      newUpdates = {
        quantity: newQty,
        current_price: price,
        total_withdraw: oldWithdraw + (qty * price)
      };
    }

    await onUpdateAsset(transactionAsset.id, newUpdates);
    resetTxForm();
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number);
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'Kripto': return <Bitcoin className="w-5 h-5" />;
      case 'Saham': return <BarChart3 className="w-5 h-5" />;
      case 'Emas': return <Coins className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  const getAssetColor = (type: string) => {
    switch (type) {
      case 'Kripto': return 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400';
      case 'Saham': return 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400';
      case 'Emas': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400';
      default: return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400';
    }
  };

  const fetchLivePrices = async () => {
    setIsRefreshing(true);
    try {
      // Free public API for Crypto (Binance) to USDT, then convert to IDR
      // We will assume 1 USD = 16000 IDR for simplicity, or fetch from an API if needed.
      const usdToIdr = 16200; // hardcoded approx rate for simplicity
      
      const cryptoAssets = assets.filter(a => a.type === 'Kripto');
      let updatedCount = 0;
      
      for (const asset of cryptoAssets) {
        const symbol = asset.name.toUpperCase().replace(/[^A-Z]/g, '') + 'USDT';
        try {
          const res = await fetch(\`https://api.binance.com/api/v3/ticker/price?symbol=\${symbol}\`);
          if (res.ok) {
            const data = await res.json();
            const priceInIdr = parseFloat(data.price) * usdToIdr;
            await onUpdateAsset(asset.id, { current_price: priceInIdr });
            updatedCount++;
          }
        } catch (e) {
          console.warn("Could not fetch price for", symbol);
        }
      }
      if (updatedCount > 0) {
        alert(\`Berhasil memperbarui harga \${updatedCount} aset kripto dari Binance.\`);
      } else {
        alert('Tidak ada aset kripto yang dapat diperbarui atau terjadi kesalahan jaringan.');
      }
    } catch (e) {
      console.error(e);
      alert('Gagal mengambil data harga.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const totalValue = assets.reduce((sum, asset) => sum + (asset.quantity * asset.current_price), 0);
  const totalInvested = assets.reduce((sum, asset) => sum + (asset.quantity * asset.average_price), 0);
  const totalGainLoss = totalValue - totalInvested;
  const isGain = totalGainLoss >= 0;

  return (
    <div className="space-y-6 pb-20 sm:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Portofolio Aset</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Pantau nilai investasi Anda.</p>
        </div>
        <button 
          onClick={fetchLivePrices}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={\`w-3.5 h-3.5 \${isRefreshing ? 'animate-spin' : ''}\`} />
          <span className="hidden sm:inline">Update Kripto</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Total Nilai Aset</p>
          <h3 className="text-3xl font-black text-white tracking-tight">{formatRupiah(totalValue)}</h3>
          
          <div className="mt-4 flex items-center gap-2">
            <div className={\`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full \${isGain ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}\`}>
              {isGain ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isGain ? '+' : ''}{formatRupiah(totalGainLoss)}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-6 w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Aset Baru
        </button>
      </div>

      {/* Form Modal Add/Edit Asset */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-xl relative animate-in zoom-in-95">
            <button onClick={resetForm} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">
              {editingAsset ? 'Edit Aset' : 'Tambah Aset Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tipe Aset</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm dark:bg-slate-950 dark:text-slate-200 outline-none"
                  >
                    <option value="Kripto">Kripto</option>
                    <option value="Saham">Saham</option>
                    <option value="Reksadana">Reksadana</option>
                    <option value="Emas">Emas</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Aset (Kode/Simbol)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="misal: BTC"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm dark:bg-slate-950 dark:text-slate-200 outline-none uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Platform / Broker</label>
                <input
                  type="text"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="misal: Indodax, Ajaib, Binance"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm dark:bg-slate-950 dark:text-slate-200 outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Jumlah</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm dark:bg-slate-950 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Harga Beli Avg</label>
                  <input
                    type="number"
                    required
                    value={averagePrice}
                    onChange={(e) => setAveragePrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm dark:bg-slate-950 dark:text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Harga Saat Ini</label>
                  <input
                    type="number"
                    required
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm dark:bg-slate-950 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary text-white font-bold rounded-xl mt-4 hover:bg-primary-hover transition-colors"
              >
                {editingAsset ? 'Simpan Perubahan' : 'Simpan Aset'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal (Deposit/Withdraw) */}
      {showTransactionForm && transactionAsset && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95">
            <button onClick={resetTxForm} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-1 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {transactionType === 'deposit' ? <ArrowDownToLine className="w-5 h-5 text-emerald-500"/> : <ArrowUpFromLine className="w-5 h-5 text-rose-500"/>}
              {transactionType === 'deposit' ? 'Deposit' : 'Withdraw'} {transactionAsset.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Saldo saat ini: {transactionAsset.quantity} unit</p>
            
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Jumlah (Unit)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={txQuantity}
                  onChange={(e) => setTxQuantity(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm dark:bg-slate-950 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Harga {transactionType === 'deposit' ? 'Beli' : 'Jual'} (IDR)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={txPrice}
                  onChange={(e) => setTxPrice(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm dark:bg-slate-950 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-300 mb-4">
                  <span>Total Transaksi:</span>
                  <span>{formatRupiah((parseFloat(txQuantity) || 0) * (parseFloat(txPrice) || 0))}</span>
                </div>
                <button
                  type="submit"
                  className={\`w-full py-3 text-white font-bold rounded-xl transition-colors \${transactionType === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}\`}
                >
                  Konfirmasi {transactionType === 'deposit' ? 'Deposit' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset List */}
      <div className="space-y-4">
        {assets.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada portofolio aset.</p>
          </div>
        ) : (
          assets.map(asset => {
            const val = asset.quantity * asset.current_price;
            const invest = asset.quantity * asset.average_price;
            const pnl = val - invest;
            const pnlPercent = invest > 0 ? (pnl / invest) * 100 : 0;
            const isProfit = pnl >= 0;
            
            const totalDep = asset.total_deposit ?? invest;
            const totalWd = asset.total_withdraw ?? 0;

            return (
              <div key={asset.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                
                {/* Top Section: Icon & Info */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className={\`p-3 rounded-xl \${getAssetColor(asset.type)}\`}>
                      {getAssetIcon(asset.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase">{asset.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{asset.type} {asset.platform && \`• \${asset.platform}\`}</p>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        {asset.quantity} unit @ {formatRupiah(asset.current_price)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                    <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                      {formatRupiah(val)}
                    </div>
                    <div className={\`text-xs font-bold flex items-center gap-1 \${isProfit ? 'text-emerald-500' : 'text-rose-500'}\`}>
                      {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Middle Section: Stats */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Total Deposit</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatRupiah(totalDep)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Total Withdraw</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatRupiah(totalWd)}</p>
                  </div>
                </div>

                {/* Bottom Section: Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openTransactionForm(asset, 'deposit')} 
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" /> Deposit
                    </button>
                    <button 
                      onClick={() => openTransactionForm(asset, 'withdraw')} 
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowUpFromLine className="w-3.5 h-3.5" /> Withdraw
                    </button>
                  </div>
                  
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(asset)} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteAsset(asset.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
`
fs.writeFileSync('src/components/Assets.tsx', content);
console.log("Done overwriting Assets.tsx");
