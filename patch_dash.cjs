const fs = require('fs');
let content = fs.readFileSync('src/lib/supabase.ts', 'utf-8');

const dashReplaceStr = `
  async getDashboardData(): Promise<DashboardData> {
    const trxs = await this.getTransactions();
    const insts = await this.getInstallments();
    const platforms = await this.getAssetPlatforms();

    let income = 0;
    let expense = 0;
    let receivable = 0;
    let paidInstallments = 0;
    let installmentOutstanding = 0;
    let totalAssetValue = 0;

    platforms.forEach(p => {
      totalAssetValue += (p.current_value || 0);
    });

    trxs.forEach(t => {
      if (t.type === 'Pendapatan') {
        income += t.amount;
      } else if (t.type === 'Pengeluaran') {
        expense += t.amount;
      } else if (t.type === 'Piutang') {
        receivable += t.amount;
      } else if (t.type === 'Cicilan') {
        paidInstallments += t.amount;
      }
    });

    insts.forEach(i => {
      if (i.status === 'Berjalan') {
        installmentOutstanding += i.remaining;
      }
    });

    // balance calculation = Income - Expense - Piutang (Out) - Cicilan (Paid)
    // Plus any custom logic you had
`;

if (content.includes('assets.forEach(a => {') && content.includes('totalAssetValue += (a.quantity * a.current_price);')) {
  // Let's do a precise string replacement
  const findStr = `    const assets = await this.getAssets();

    let income = 0;
    let expense = 0;
    let receivable = 0; // Piutang yang masih belum lunas / aktif
    let paidInstallments = 0;
    let installmentOutstanding = 0; // Sisa cicilan yang belum dibayar
    let totalAssetValue = 0;

    assets.forEach(a => {
      totalAssetValue += (a.quantity * a.current_price);
    });`;

  const replaceStr = `    const platforms = await this.getAssetPlatforms();

    let income = 0;
    let expense = 0;
    let receivable = 0;
    let paidInstallments = 0;
    let installmentOutstanding = 0;
    let totalAssetValue = 0;

    platforms.forEach(p => {
      totalAssetValue += (p.current_value || 0);
    });`;

  content = content.replace(findStr, replaceStr);
  fs.writeFileSync('src/lib/supabase.ts', content);
  console.log("Patched getDashboardData");
} else {
  console.log("Could not find precise target block for getDashboardData.");
}
