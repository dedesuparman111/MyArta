const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('onAddPlatform')) {
  // Add handler methods
  const handlers = `
  const handleAddPlatform = async (platform: any) => {
    const res = await apiService.addAssetPlatform(platform);
    if (res.success) await loadCoreData();
    return res.success;
  };
  const handleUpdatePlatform = async (id: string, updates: any) => {
    const res = await apiService.updateAssetPlatform(id, updates);
    if (res.success) await loadCoreData();
    return res.success;
  };
  const handleDeletePlatform = async (id: string) => {
    if (window.confirm('Yakin hapus platform ini? Semua aset di dalamnya mungkin terpengaruh.')) {
      const res = await apiService.deleteAssetPlatform(id);
      if (res.success) await loadCoreData();
      return res.success;
    }
    return false;
  };
`;
  
  content = content.replace(
    /const handleAddAsset = async/,
    handlers + "\n  const handleAddAsset = async"
  );
  
  content = content.replace(
    /<Assets\s+assets=\{assets\}\s+onAddAsset=\{handleAddAsset\}\s+onUpdateAsset=\{handleUpdateAsset\}\s+onDeleteAsset=\{handleDeleteAsset\}\s*\/>/,
    `<Assets \n            assets={assets} \n            platforms={assetPlatforms} \n            onAddAsset={handleAddAsset} \n            onUpdateAsset={handleUpdateAsset} \n            onDeleteAsset={handleDeleteAsset} \n            onAddPlatform={handleAddPlatform}\n            onUpdatePlatform={handleUpdatePlatform}\n            onDeletePlatform={handleDeletePlatform}\n          />`
  );
  
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched App.tsx handlers");
}
