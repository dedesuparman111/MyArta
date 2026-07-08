const fs = require('fs');
let content = fs.readFileSync('src/lib/supabase.ts', 'utf-8');

// Change getLocalData to ensure it returns an array if defaultData is an array
const targetStr = `const getLocalData = <T>(key: string, defaultData: T): T => {
  if (typeof window === 'undefined') return defaultData;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultData;
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return defaultData;
  }
};`;

const newStr = `const getLocalData = <T>(key: string, defaultData: T): T => {
  if (typeof window === 'undefined') return defaultData;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return defaultData;
    const parsed = JSON.parse(item);
    if (Array.isArray(defaultData) && !Array.isArray(parsed)) {
      return defaultData;
    }
    return parsed;
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return defaultData;
  }
};`;

if (content.includes("const getLocalData = <T>(key: string, defaultData: T): T => {")) {
  // Let's just use string replace for the whole function body
  const regex = /const getLocalData = <T>\(key: string, defaultData: T\): T => \{[\s\S]*?\n\};/;
  content = content.replace(regex, newStr);
  fs.writeFileSync('src/lib/supabase.ts', content);
  console.log("Patched getLocalData");
} else {
  console.log("Could not find getLocalData");
}
