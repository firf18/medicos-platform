/**
 * Example usage of ResponsibilityAnalyzer
 * Demonstrates how to analyze files for multiple responsibilities and mixed concerns
 */

import { ResponsibilityAnalyzer } from '../ResponsibilityAnalyzer';
import { FileUtils } from '../file-utils';
import path from 'path';

async function demonstrateResponsibilityAnalysis() {
  console.log('🔍 Responsibility Analysis Example\n');

  // Initialize analyzer with custom configuration
  const analyzer = new ResponsibilityAnalyzer({
    maxResponsibilities: 2, // Stricter threshold
    enableHeuristics: true,
    strictMode: false
  });

  const fileUtils = new FileUtils();

  try {
    // Example 1: Analyze a single file with mixed concerns
    console.log('📄 Example 1: Analyzing a complex React component...\n');
    
    const complexComponentPath = path.join(process.cwd(), 'src/components/dashboard/PatientDashboard.tsx');
    
    if (await fileUtils.fileExists(complexComponentPath)) {
      const result = await analyzer.analyzeFile(complexComponentPath);
      
      console.log(`File: ${result.filePath}`);
      console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`Responsibilities found: ${result.analysis.responsibilities.length}`);
      console.log(`Has multiple responsibilities: ${result.analysis.hasMultipleResponsibilities}`);
      
      if (result.analysis.responsibilities.length > 0) {
        console.log('\n📋 Detected Responsibilities:');
        result.analysis.responsibilities.forEach((resp, index) => {
          console.log(`  ${index + 1}. ${resp}`);
        });
      }

      if (result.issues.length > 0) {
        console.log('\n⚠️  Issues Found:');
        result.issues.forEach((issue, index) => {
          console.log(`  ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
        });
      }

      if (result.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        result.recommendations
          .sort((a, b) => b.priority - a.priority)
          .forEach((rec, index) => {
            console.log(`  ${index + 1}. [Priority: ${rec.priority}] ${rec.description}`);
            console.log(`     Effort: ${rec.estimatedEffort}, Type: ${rec.type}`);
            if (rec.benefits.length > 0) {
              console.log(`     Benefits: ${rec.benefits.join(', ')}`);
            }
          });
      }

      if (result.analysis.separationSuggestions.length > 0) {
        console.log('\n🔧 Separation Strategies:');
        result.analysis.separationSuggestions.forEach((strategy, index) => {
          console.log(`  ${index + 1}. ${strategy.description}`);
          console.log(`     Type: ${strategy.type}, Effort: ${strategy.estimatedEffort}`);
          console.log(`     Target files: ${strategy.targetFiles.join(', ')}`);
        });
      }
    } else {
      console.log(`File not found: ${complexComponentPath}`);
      console.log('Creating a sample analysis with mock data...\n');
      
      // Create a sample analysis result for demonstration
      await demonstrateWithSampleCode();
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Example 2: Batch analysis of multiple files
    console.log('📁 Example 2: Batch analysis of component directory...\n');
    
    const componentDir = path.join(process.cwd(), 'src/components');
    
    if (await fileUtils.fileExists(componentDir)) {
      const files = await fileUtils.scanDirectory(componentDir, {
        includePatterns: ['**/*.tsx', '**/*.ts'],
        excludePatterns: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
        maxDepth: 3
      });

      // Analyze first 5 files for demonstration
      const filesToAnalyze = files.slice(0, 5);
      
      if (filesToAnalyze.length > 0) {
        console.log(`Analyzing ${filesToAnalyze.length} files...`);
        
        const report = await analyzer.analyzeFiles(filesToAnalyze);
        
        console.log('\n📊 Analysis Report Summary:');
        console.log(`Total files analyzed: ${report.totalFiles}`);
        console.log(`Files with multiple responsibilities: ${report.filesWithMultipleResponsibilities}`);
        console.log(`Average responsibilities per file: ${report.averageResponsibilities.toFixed(2)}`);
        
        if (report.summary.mostCommonIssues.length > 0) {
          console.log('\n🔥 Most Common Issues:');
          report.summary.mostCommonIssues.forEach((issue, index) => {
            console.log(`  ${index + 1}. ${issue}`);
          });
        }

        if (report.summary.recommendedActions.length > 0) {
          console.log('\n🎯 Most Recommended Actions:');
          report.summary.recommendedActions.forEach((action, index) => {
            console.log(`  ${index + 1}. ${action}`);
          });
        }

        // Show detailed results for files with issues
        const problematicFiles = report.results.filter(r => r.analysis.hasMultipleResponsibilities);
        if (problematicFiles.length > 0) {
          console.log('\n🚨 Files Requiring Attention:');
          problematicFiles.forEach((result, index) => {
            console.log(`  ${index + 1}. ${path.basename(result.filePath)}`);
            console.log(`     Responsibilities: ${result.analysis.responsibilities.join(', ')}`);
            console.log(`     Issues: ${result.issues.length}, Recommendations: ${result.recommendations.length}`);
          });
        }
      } else {
        console.log('No TypeScript/React files found in components directory.');
      }
    } else {
      console.log(`Components directory not found: ${componentDir}`);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Example 3: Demonstrate specific responsibility detection
    console.log('🎯 Example 3: Specific responsibility pattern detection...\n');
    await demonstrateSpecificPatterns();

  } catch (error) {
    console.error('❌ Error during analysis:', error);
  }
}

async function demonstrateWithSampleCode() {
  const analyzer = new ResponsibilityAnalyzer();
  
  // Create a temporary file with sample problematic code
  const sampleCode = `
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { z } from 'zod';
import axios from 'axios';

const patientSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(0)
});

export const ProblematicPatientComponent: React.FC = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Data access mixed with component
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      setPatients(data || []);
      setLoading(false);
    };
    fetchPatients();
  }, []);

  // Business logic in component
  const calculateRiskScore = (patient: any) => {
    let score = 0;
    if (patient.age > 65) score += 30;
    if (patient.chronic_conditions?.length > 0) score += 20;
    if (patient.medications?.length > 5) score += 15;
    return score;
  };

  // Validation logic in component
  const validatePatientData = (data: any) => {
    try {
      return patientSchema.parse(data);
    } catch (error) {
      console.error('Validation failed:', error);
      return null;
    }
  };

  // API communication in component
  const syncWithExternalSystem = async (patientId: string) => {
    try {
      const response = await axios.post('/api/external/sync', {
        patientId,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // Event handlers
  const handlePatientSelect = (patient: any) => {
    const validated = validatePatientData(patient);
    if (validated) {
      syncWithExternalSystem(patient.id);
    }
  };

  if (loading) return <div>Cargando pacientes...</div>;

  return (
    <div className="patient-dashboard">
      <h1>Dashboard de Pacientes</h1>
      <div className="patient-list">
        {patients.map(patient => (
          <div 
            key={patient.id} 
            className="patient-card"
            onClick={() => handlePatientSelect(patient)}
          >
            <h3>{patient.name}</h3>
            <p>Edad: {patient.age}</p>
            <p>Riesgo: {calculateRiskScore(patient)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
`;

  // Write sample code to a temporary file
  const fs = await import('fs/promises');
  const tempFile = 'temp-sample-component.tsx';
  
  try {
    await fs.writeFile(tempFile, sampleCode);
    
    const result = await analyzer.analyzeFile(tempFile);
    
    console.log('📄 Sample Component Analysis:');
    console.log(`Responsibilities: ${result.analysis.responsibilities.join(', ')}`);
    console.log(`Has multiple responsibilities: ${result.analysis.hasMultipleResponsibilities}`);
    console.log(`Issues found: ${result.issues.length}`);
    console.log(`Recommendations: ${result.recommendations.length}`);
    
    if (result.issues.length > 0) {
      console.log('\n⚠️  Sample Issues:');
      result.issues.slice(0, 3).forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.description}`);
      });
    }

    // Clean up
    await fs.unlink(tempFile);
    
  } catch (error) {
    console.error('Error with sample analysis:', error);
  }
}

async function demonstrateSpecificPatterns() {
  const analyzer = new ResponsibilityAnalyzer();
  
  const patterns = [
    {
      name: 'Pure Data Access Layer',
      code: `
export class PatientRepository {
  async findById(id: string) {
    return await supabase.from('patients').select('*').eq('id', id).single();
  }
  
  async create(data: any) {
    return await supabase.from('patients').insert(data);
  }
}
`
    },
    {
      name: 'Pure Validation Module',
      code: `
import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

export const validatePatient = (data: unknown) => {
  return patientSchema.parse(data);
};
`
    },
    {
      name: 'Pure UI Component',
      code: `
import React from 'react';

interface Props {
  patient: { name: string; age: number };
  onSelect: (id: string) => void;
}

export const PatientCard: React.FC<Props> = ({ patient, onSelect }) => {
  return (
    <div onClick={() => onSelect(patient.id)}>
      <h3>{patient.name}</h3>
      <p>Edad: {patient.age}</p>
    </div>
  );
};
`
    }
  ];

  const fs = await import('fs/promises');
  
  for (const pattern of patterns) {
    const tempFile = `temp-${pattern.name.toLowerCase().replace(/\s+/g, '-')}.tsx`;
    
    try {
      await fs.writeFile(tempFile, pattern.code);
      const result = await analyzer.analyzeFile(tempFile);
      
      console.log(`🎯 ${pattern.name}:`);
      console.log(`  Responsibilities: ${result.analysis.responsibilities.join(', ') || 'None detected'}`);
      console.log(`  Multiple responsibilities: ${result.analysis.hasMultipleResponsibilities}`);
      console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      
      await fs.unlink(tempFile);
      
    } catch (error) {
      console.error(`Error analyzing ${pattern.name}:`, error);
    }
  }
}

// Run the demonstration
if (require.main === module) {
  demonstrateResponsibilityAnalysis()
    .then(() => {
      console.log('\n✅ Responsibility analysis demonstration completed!');
      console.log('\n💡 Next steps:');
      console.log('  1. Run analysis on your actual codebase');
      console.log('  2. Review recommendations and prioritize changes');
      console.log('  3. Implement separation strategies gradually');
      console.log('  4. Re-run analysis to measure improvements');
    })
    .catch(error => {
      console.error('❌ Demonstration failed:', error);
      process.exit(1);
    });
}

export { demonstrateResponsibilityAnalysis };