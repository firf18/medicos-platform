/**
 * Example usage of FileSizeAnalyzer
 * Demonstrates how to analyze files for size issues and get split suggestions
 */

import { FileSizeAnalyzer } from '../FileSizeAnalyzer';
import { FileUtils } from '../file-utils';

async function demonstrateFileSizeAnalysis() {
  console.log('🔍 File Size Analysis Example\n');

  // Create analyzer with custom configuration
  const analyzer = new FileSizeAnalyzer({
    threshold: 300, // Lower threshold for demo
    excludeComments: true,
    excludeEmptyLines: true,
    excludeImports: false
  });

  // Example: Analyze a specific file
  console.log('📁 Analyzing individual file...');
  try {
    const singleFileResult = await analyzer.analyzeFile('src/components/dashboard/PatientDashboard.tsx');
    
    console.log(`File: ${singleFileResult.filePath}`);
    console.log(`Lines: ${singleFileResult.lineCount}`);
    console.log(`Exceeds threshold: ${singleFileResult.exceedsThreshold}`);
    
    if (singleFileResult.splitSuggestions.length > 0) {
      console.log('Split suggestions:');
      singleFileResult.splitSuggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion.description}`);
        console.log(`     Type: ${suggestion.type}`);
        console.log(`     Effort: ${suggestion.estimatedEffort}`);
        console.log(`     Target files: ${suggestion.targetFiles.join(', ')}`);
      });
    }
  } catch (error) {
    console.log('File not found or error occurred:', error);
  }

  console.log('\n📊 Analyzing multiple files...');
  
  // Example: Analyze multiple files
  const fileUtils = new FileUtils();
  const sourceFiles = await fileUtils.scanDirectory('src', {
    includePatterns: ['**/*.tsx', '**/*.ts'],
    excludePatterns: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**'],
    maxDepth: 5
  });

  // Take first 5 files for demo
  const filesToAnalyze = sourceFiles.slice(0, 5);
  
  if (filesToAnalyze.length > 0) {
    const report = await analyzer.analyzeFiles(filesToAnalyze);
    
    console.log('📈 Analysis Summary:');
    console.log(`Total files analyzed: ${report.summary.totalFiles}`);
    console.log(`Files exceeding threshold: ${report.summary.oversizedFiles}`);
    console.log(`Average file size: ${report.summary.averageFileSize} lines`);
    console.log(`Total split suggestions: ${report.summary.totalSuggestions}`);
    console.log(`Threshold: ${report.summary.threshold} lines\n`);

    // Show details for oversized files
    const oversizedFiles = report.results.filter(r => r.exceedsThreshold);
    if (oversizedFiles.length > 0) {
      console.log('🚨 Oversized files:');
      oversizedFiles.forEach(file => {
        console.log(`\n📄 ${file.filePath}`);
        console.log(`   Lines: ${file.lineCount}`);
        console.log(`   Suggestions: ${file.splitSuggestions.length}`);
        
        file.splitSuggestions.forEach((suggestion, index) => {
          console.log(`   ${index + 1}. ${suggestion.description}`);
        });
      });
    }
  } else {
    console.log('No source files found to analyze.');
  }

  console.log('\n✅ File size analysis complete!');
}

// Run the example if this file is executed directly
if (require.main === module) {
  demonstrateFileSizeAnalysis().catch(console.error);
}

export { demonstrateFileSizeAnalysis };