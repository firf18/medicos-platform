#!/usr/bin/env node

/**
 * Script para corregir las importaciones de componentes UI
 * Convierte las importaciones absolutas (@/components/ui) a relativas
 */

const fs = require('fs');
const path = require('path');

function findTsxFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTsxFiles(fullPath, files);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function getRelativePath(fromFile, toDir) {
  const fromDir = path.dirname(fromFile);
  const relativePath = path.relative(fromDir, toDir);
  return relativePath.replace(/\\/g, '/'); // Convert Windows paths to Unix style
}

function fixImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const uiComponentsPath = path.resolve('src/components/ui');
  
  // Check if file has UI component imports
  if (!content.includes('@/components/ui')) {
    return false;
  }
  
  console.log(`Fixing imports in: ${filePath}`);
  
  const relativePath = getRelativePath(filePath, uiComponentsPath);
  
  // Replace all @/components/ui imports with relative paths
  const fixedContent = content.replace(
    /@\/components\/ui/g, 
    relativePath
  );
  
  fs.writeFileSync(filePath, fixedContent, 'utf8');
  return true;
}

// Main execution
console.log('🔧 Fixing UI component imports...\n');

const srcDir = path.resolve('src');
const files = findTsxFiles(srcDir);
let fixedCount = 0;

for (const file of files) {
  if (fixImports(file)) {
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('🎉 All UI component imports have been corrected!');