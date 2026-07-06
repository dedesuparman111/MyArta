#!/bin/bash
for file in src/components/*.tsx; do
  sed -i 's/blue-500\/20/primary\/20/g' "$file"
  sed -i 's/to-blue-700/to-primary-hover/g' "$file"
  sed -i 's/from-blue-700/from-primary-hover/g' "$file"
  sed -i 's/text-blue-100/text-white\/80/g' "$file"
  sed -i 's/bg-blue-300\/10/bg-primary\/10/g' "$file"
  sed -i 's/bg-blue-400\/10/bg-primary\/10/g' "$file"
  sed -i 's/text-blue-950/text-slate-900/g' "$file"
  sed -i 's/text-blue-200/text-slate-200/g' "$file"
done
