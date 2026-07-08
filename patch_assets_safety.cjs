const fs = require('fs');
let content = fs.readFileSync('src/components/Assets.tsx', 'utf-8');

const safetyStr = `
  const safePlatforms = platforms || [];
  const safeAssets = assets || [];

  const totalGlobalValue = safePlatforms.reduce((acc, p) => acc + Number(p.current_value || 0), 0);
  const totalGlobalModal = safePlatforms.reduce((acc, p) => acc + (Number(p.total_deposit || 0) - Number(p.total_withdraw || 0)), 0);
`;

content = content.replace(
  /const totalGlobalValue = platforms\.reduce[^;]+;/,
  safetyStr.trim()
);
content = content.replace(
  /const totalGlobalModal = platforms\.reduce[^;]+;/,
  ""
);

content = content.replace(/platforms\.length/g, "safePlatforms.length");
content = content.replace(/platforms\.map/g, "safePlatforms.map");
content = content.replace(/assets\.filter/g, "safeAssets.filter");

fs.writeFileSync('src/components/Assets.tsx', content);
console.log("Patched Assets safety");
