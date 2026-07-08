const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldAssets = `<Assets
              assets={assets}
              formatRupiah={formatRupiah}
              onAddAsset={handleAddAsset}
              onUpdateAsset={handleUpdateAsset}
              onDeleteAsset={handleDeleteAsset}
            />`;

const newAssets = `<Assets 
              assets={assets} 
              platforms={assetPlatforms} 
              onAddAsset={handleAddAsset} 
              onUpdateAsset={handleUpdateAsset} 
              onDeleteAsset={handleDeleteAsset} 
              onAddPlatform={handleAddPlatform}
              onUpdatePlatform={handleUpdatePlatform}
              onDeletePlatform={handleDeletePlatform}
            />`;

if (content.includes('formatRupiah={formatRupiah}')) {
  // Let's use regex to replace it
  content = content.replace(/<Assets[\s\S]*?\/>/, newAssets);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched Assets props");
} else {
  console.log("Could not find oldAssets block");
}
