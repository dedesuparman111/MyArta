const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('assetPlatforms')) {
  content = content.replace(
    /const \[assets, setAssets\] = useState<Asset\[\]>\(\[\]\);/,
    "const [assets, setAssets] = useState<Asset[]>([]);\n  const [assetPlatforms, setAssetPlatforms] = useState<any[]>([]);"
  );
  
  content = content.replace(
    /const resAssets = await apiService\.getAssets\(\);/,
    "const resAssets = await apiService.getAssets();\n      const resPlatforms = await apiService.getAssetPlatforms();\n      setAssetPlatforms(resPlatforms);"
  );
  
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patched App.tsx states");
}
