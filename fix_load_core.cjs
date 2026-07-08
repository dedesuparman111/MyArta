const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldLoadCore = `      const [trxs, insts, dash, goals, asts] = await Promise.all([
        apiService.getTransactions(),
        apiService.getInstallments(),
        apiService.getDashboardData(),
        apiService.getSavingsGoals(),
        apiService.getAssets(),
      ]);
      setTransactions(trxs);
      setInstallments(insts);
      setDashboardData(dash);
      setSavingsGoals(goals);
      setAssets(asts);`;

const newLoadCore = `      const [trxs, insts, dash, goals, asts, plats] = await Promise.all([
        apiService.getTransactions(),
        apiService.getInstallments(),
        apiService.getDashboardData(),
        apiService.getSavingsGoals(),
        apiService.getAssets(),
        apiService.getAssetPlatforms()
      ]);
      setTransactions(trxs);
      setInstallments(insts);
      setDashboardData(dash);
      setSavingsGoals(goals);
      setAssets(asts);
      setAssetPlatforms(plats);`;

if (content.includes('setAssets(asts);')) {
  content = content.replace(oldLoadCore, newLoadCore);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched loadCoreData");
} else {
  console.log("Could not find oldLoadCore");
}
