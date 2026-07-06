const fs = require('fs');

let content = fs.readFileSync('src/components/Transactions.tsx', 'utf8');

const scanImports = `import { Plus, Search, Filter, Edit, Trash2, Calendar, FileText, Tag, ArrowDownRight, ArrowUpRight, DollarSign, Wallet, Camera, Loader2 } from 'lucide-react';`;

content = content.replace(/import \{ Plus, Search[\s\S]*?\} from 'lucide-react';/, scanImports);

const scanState = `  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('Pendapatan');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [installmentId, setInstallmentId] = useState('');

  // AI Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data) {
        setType('Pengeluaran');
        if (data.data.amount) setAmount(data.data.amount.toString());
        if (data.data.category) setCategory(data.data.category);
        if (data.data.description) setDescription(data.data.description);
      } else {
        setScanError(data.message || 'Gagal memindai struk.');
      }
    } catch (err: any) {
      setScanError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsScanning(false);
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };
`;

content = content.replace(/  \/\/ Form State\n  const \[date, setDate\] = useState\([\s\S]*?const \[category, setCategory\] = useState\(''\);/, `  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('Pendapatan');
  const [category, setCategory] = useState('');`);

content = content.replace(/  \/\/ Form State[\s\S]*?const \[installmentId, setInstallmentId\] = useState\(''\);/, scanState);

const scanUI = `            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
              </h3>
              
              {!editingTransaction && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    id="receipt-upload"
                    className="hidden"
                    onChange={handleScanReceipt}
                    disabled={isScanning}
                  />
                  <label
                    htmlFor="receipt-upload"
                    className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${
                      isScanning 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
                    }\`}
                  >
                    {isScanning ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                    {isScanning ? 'Memindai...' : 'Scan Struk (AI)'}
                  </label>
                </div>
              )}
            </div>

            {scanError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">
                {scanError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">`;

content = content.replace(/            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">\s*<h3[\s\S]*?<\/h3>\s*<\/div>\s*<form onSubmit=\{handleSubmit\} className="p-6 space-y-4">/, scanUI);

fs.writeFileSync('src/components/Transactions.tsx', content);
