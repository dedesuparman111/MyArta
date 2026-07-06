import React, { useState } from 'react';
import { Asset } from '../types';
import { Briefcase, Plus, TrendingUp, TrendingDown, Edit2, Trash2, X, Bitcoin, Landmark, Building2, Coins, CircleDollarSign } from 'lucide-react';

interface AssetsProps {
  assets: Asset[];
  formatRupiah: (val: number) => string;
  onAddAsset: (asset: Omit<Asset, 'id'>) => Promise<boolean>;
  onUpdateAsset: (id: string, updates: Partial<Asset>) => Promise<boolean>;
  onDeleteAsset: (id: string) => Promise<boolean>;
}

export const Assets: React.FC<AssetsProps> = ({
  assets,
  formatRupiah,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  
  const [name, setName] = useState('');
  const [type, setType] = useState<Asset['type']>('Kripto');
  const [platform, setPlatform] = useState('');
  const [quantity, setQuantity] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setName(asset.name);
    setType(asset.type);
    setPlatform(asset.platform || '');
    setQuantity(asset.quantity.toString());
    setAveragePrice(asset.average_price.toString());
    setCurrentPrice(asset.current_price.toString());
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditingAsset(null);
    setName('');
    setType('Kripto');
    setPlatform('');
    setQuantity('');
    setAveragePrice('');
    setCurrentPrice('');
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !averagePrice || !currentPrice) return;

    const payload = {
      name,
      type,
      platform,
      quantity: parseFloat(quantity),
      average_price: parseFloat(averagePrice),
      current_price: parseFloat(currentPrice),
    };

    let success = false;
    if (editingAsset) {
      success = await onUpdateAsset(editingAsset.id, payload);
    } else {
      success = await onAddAsset(payload);
    }

    if (success) {
      resetForm();
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'Kripto': return <Bitcoin className="w-5 h-5" />;
      case 'Saham': return <Building2 className="w-5 h-5" />;
      case 'Reksadana': return <Landmark className="w-5 h-5" />;
      case 'Emas': return <Coins className="w-5 h-5" />;
      default: return <CircleDollarSign className="w-5 h-5" />;
    }
  };

  const getAssetColor = (type: string) => {
    switch (type) {
      case 'Kripto': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'Saham': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'Reksadana': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      case 'Emas': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const totalAssetValue = assets.reduce((acc, val) => acc + (val.quantity * val.current_price), 0);
  const totalInvestment = assets.reduce((acc, val) => acc + (val.quantity * val.average_price), 0);
  const totalGainLoss = totalAssetValue - totalInvestment;
  const isGain = totalGainLoss >= 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Header Summary */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Briefcase className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Portofolio Digital</h2>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Total Nilai Aset</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {formatRupiah(totalAssetValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Unrealized PnL</p>
            <div className={`flex items-center gap-1.5 text-sm font-bold ${isGain ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isGain ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isGain ? '+' : ''}{formatRupiah(totalGainLoss)}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="mt-6 w-full py-2.5 bg-slate-900 dark:bg-primary text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Aset Baru
        </button>
      </div>

      {/* Form Modal */}
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
                    placeholder="misal: BBCA"
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
                  placeholder="misal: Indodax, Ajaib"
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

      {/* Asset List */}
      <div className="space-y-3">
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

            return (
              <div key={asset.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-xl ${getAssetColor(asset.type)}`}>
                    {getAssetIcon(asset.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase">{asset.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{asset.type} {asset.platform && `• ${asset.platform}`}</p>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      {asset.quantity} unit @ {formatRupiah(asset.current_price)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center px-2 sm:px-0">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {formatRupiah(val)}
                  </div>
                  <div className={`text-xs font-bold flex items-center gap-1 ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                  <button onClick={() => handleEdit(asset)} className="p-2 text-slate-400 hover:text-primary transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDeleteAsset(asset.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
