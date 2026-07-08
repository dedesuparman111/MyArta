const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf-8');

const assetPlatformStr = `export interface AssetPlatform {
  id: string;
  created_at?: string;
  user_id?: string;
  name: string;
  total_deposit: number;
  total_withdraw: number;
  current_value: number;
}
`;

if (!content.includes('AssetPlatform')) {
  content += '\n' + assetPlatformStr;
}

if (!content.includes('platform_id?: string;')) {
  content = content.replace(
    /export interface Asset \{/,
    "export interface Asset {\n  platform_id?: string;"
  );
}

fs.writeFileSync('src/types.ts', content);
