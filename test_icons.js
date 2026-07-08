try {
  const lucide = require('lucide-react');
  const icons = ['Plus', 'Edit2', 'Trash2', 'TrendingUp', 'TrendingDown', 'Briefcase', 'Bitcoin', 'BarChart3', 'Coins', 'X', 'ArrowDownToLine', 'ArrowUpFromLine', 'RefreshCw', 'ChevronDown', 'ChevronUp'];
  const missing = [];
  for (const i of icons) {
    if (!lucide[i]) missing.push(i);
  }
  if (missing.length > 0) {
    console.log("Missing icons:", missing.join(', '));
  } else {
    console.log("All icons found");
  }
} catch(e) {
  console.error("Error:", e);
}
