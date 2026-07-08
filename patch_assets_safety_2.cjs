const fs = require('fs');
let content = fs.readFileSync('src/components/Assets.tsx', 'utf-8');

const safetyStr = `
  const safePlatforms = Array.isArray(platforms) ? platforms : [];
  const safeAssets = Array.isArray(assets) ? assets : [];

  const totalGlobalValue = safePlatforms.reduce((acc, p) => acc + Number(p.current_value || 0), 0);
  const totalGlobalModal = safePlatforms.reduce((acc, p) => acc + (Number(p.total_deposit || 0) - Number(p.total_withdraw || 0)), 0);
`;

content = content.replace(
  /const safePlatforms = platforms \|\| \[\];\s*const safeAssets = assets \|\| \[\];\s*const totalGlobalValue = safePlatforms\.reduce[^;]+;\s*const totalGlobalModal = safePlatforms\.reduce[^;]+;/,
  safetyStr.trim()
);

fs.writeFileSync('src/components/Assets.tsx', content);
console.log("Patched Assets safety with Array.isArray");
