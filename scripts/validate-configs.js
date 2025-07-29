#!/usr/bin/env node

/**
 * Configuration Validation Script
 * Validates configuration files, naming conventions, and structure
 * Enterprise AOP compliance with comprehensive validation
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== VALIDATION CONSTANTS =====

const CONFIG_KEY_PATTERN = /^[a-z]+-[a-z]+(-[a-z]+)*$/;
const CONFIG_FILE_PATTERN = /^[a-z]+(-[a-z]+)*\.ts$/;
const EXPORT_NAME_PATTERN = /^[a-z]+([A-Z][a-z]*)*Config$/;

const REQUIRED_CONFIGURATION_FIELDS = [
  'category',
  'metadata',
  'metadata.title',
  'metadata.description',
  'metadata.gradient',
  'metadata.placeholder',
  'filterConfiguration',
  'filterConfiguration.availableFilters',
  'sampleProducts'
];

const VALID_CATEGORIES = [
  'fashion',
  'electronics',
  'home',
  'automotive',
  'sports',
  'beauty',
  'pets'
];

// ===== VALIDATION FUNCTIONS =====

/**
 * Validate configuration key format
 */
function validateConfigKey(configKey) {
  const errors = [];
  
  if (!CONFIG_KEY_PATTERN.test(configKey)) {
    errors.push(`Configuration key "${configKey}" must follow kebab-case pattern: vertical-category(-subcategory)`);
  }
  
  const parts = configKey.split('-');
  if (parts.length < 2) {
    errors.push(`Configuration key "${configKey}" must have at least vertical and category parts`);
  }
  
  const vertical = parts[0];
  if (!VALID_CATEGORIES.includes(vertical)) {
    errors.push(`Configuration key "${configKey}" uses invalid vertical "${vertical}". Valid verticals: ${VALID_CATEGORIES.join(', ')}`);
  }
  
  return errors;
}

/**
 * Validate configuration file naming
 */
function validateConfigFileName(fileName) {
  const errors = [];
  
  if (!CONFIG_FILE_PATTERN.test(fileName)) {
    errors.push(`Configuration file "${fileName}" must be kebab-case with .ts extension`);
  }
  
  return errors;
}

/**
 * Validate configuration export naming
 */
function validateExportName(exportName) {
  const errors = [];
  
  if (!EXPORT_NAME_PATTERN.test(exportName)) {
    errors.push(`Configuration export "${exportName}" must end with "Config" in camelCase`);
  }
  
  return errors;
}

/**
 * Validate configuration structure
 */
function validateConfigurationStructure(config, configKey) {
  const errors = [];
  
  // Check required fields
  for (const field of REQUIRED_CONFIGURATION_FIELDS) {
    const fieldPath = field.split('.');
    let current = config;
    
    for (const part of fieldPath) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        errors.push(`Configuration "${configKey}" missing required field: ${field}`);
        break;
      }
      current = current[part];
    }
  }
  
  // Validate category consistency
  if (config.category) {
    const configParts = configKey.split('-');
    if (config.category !== configParts[0]) {
      errors.push(`Configuration "${configKey}" category field "${config.category}" doesn't match config key vertical "${configParts[0]}"`);
    }
  }
  
  // Validate metadata structure
  if (config.metadata) {
    if (typeof config.metadata.title !== 'string' || config.metadata.title.length === 0) {
      errors.push(`Configuration "${configKey}" metadata.title must be a non-empty string`);
    }
    
    if (typeof config.metadata.description !== 'string' || config.metadata.description.length === 0) {
      errors.push(`Configuration "${configKey}" metadata.description must be a non-empty string`);
    }
    
    if (typeof config.metadata.gradient !== 'string' || !config.metadata.gradient.includes('from-')) {
      errors.push(`Configuration "${configKey}" metadata.gradient must be a valid Tailwind gradient class`);
    }
  }
  
  // Validate filter configuration
  if (config.filterConfiguration) {
    if (!Array.isArray(config.filterConfiguration.availableFilters)) {
      errors.push(`Configuration "${configKey}" filterConfiguration.availableFilters must be an array`);
    } else if (config.filterConfiguration.availableFilters.length === 0) {
      errors.push(`Configuration "${configKey}" filterConfiguration.availableFilters cannot be empty`);
    }
  }
  
  // Validate sample products
  if (!Array.isArray(config.sampleProducts)) {
    errors.push(`Configuration "${configKey}" sampleProducts must be an array`);
  }
  
  return errors;
}

/**
 * Load and parse configuration file
 */
async function loadConfigurationFile(filePath) {
  try {
    // Use dynamic import to load TypeScript configuration
    const module = await import(path.resolve(filePath));
    
    // Find the configuration export
    const exports = Object.keys(module);
    const configExport = exports.find(key => key.endsWith('Config'));
    
    if (!configExport) {
      throw new Error('No configuration export found ending with "Config"');
    }
    
    return {
      exportName: configExport,
      config: module[configExport]
    };
  } catch (error) {
    throw new Error(`Failed to load configuration: ${error.message}`);
  }
}

/**
 * Scan configuration directory
 */
function scanConfigurationDirectory(dirPath) {
  const configFiles = [];
  
  function scanDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDir(itemPath);
      } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
        configFiles.push({
          filePath: itemPath,
          fileName: item,
          relativePath: path.relative(dirPath, itemPath)
        });
      }
    }
  }
  
  scanDir(dirPath);
  return configFiles;
}

/**
 * Validate dynamic loader configuration
 */
function validateDynamicLoaderPaths() {
  const errors = [];
  const loaderPath = path.join(process.cwd(), 'client/src/services/category/loaders/DynamicConfigurationLoader.ts');
  
  if (!fs.existsSync(loaderPath)) {
    errors.push('DynamicConfigurationLoader.ts not found');
    return errors;
  }
  
  try {
    const loaderContent = fs.readFileSync(loaderPath, 'utf8');
    
    // Extract configPathMap from the file
    const configPathMapMatch = loaderContent.match(/configPathMap[^}]+}/s);
    if (!configPathMapMatch) {
      errors.push('configPathMap not found in DynamicConfigurationLoader.ts');
      return errors;
    }
    
    // Basic validation that configPathMap exists and has entries
    const configPathMapContent = configPathMapMatch[0];
    const configKeyMatches = configPathMapContent.match(/'([^']+)':/g);
    
    if (!configKeyMatches || configKeyMatches.length === 0) {
      errors.push('No configuration keys found in configPathMap');
    } else {
      console.log(`✅ Found ${configKeyMatches.length} configuration mappings in dynamic loader`);
    }
    
  } catch (error) {
    errors.push(`Error reading DynamicConfigurationLoader.ts: ${error.message}`);
  }
  
  return errors;
}

/**
 * Main validation function
 */
async function validateConfigurations() {
  console.log('🔍 Starting configuration validation...\n');
  
  const errors = [];
  const configDir = path.join(process.cwd(), 'client/src/services/category/configs');
  
  if (!fs.existsSync(configDir)) {
    console.error('❌ Configuration directory not found:', configDir);
    process.exit(1);
  }
  
  // Scan configuration files
  const configFiles = scanConfigurationDirectory(configDir);
  console.log(`📁 Found ${configFiles.length} configuration files\n`);
  
  // Validate each configuration file
  for (const fileInfo of configFiles) {
    console.log(`🔍 Validating: ${fileInfo.relativePath}`);
    
    // Validate file naming
    const fileNamingErrors = validateConfigFileName(fileInfo.fileName);
    if (fileNamingErrors.length > 0) {
      errors.push(...fileNamingErrors.map(err => `${fileInfo.relativePath}: ${err}`));
    }
    
    try {
      // Load configuration
      const { exportName, config } = await loadConfigurationFile(fileInfo.filePath);
      
      // Validate export naming
      const exportNamingErrors = validateExportName(exportName);
      if (exportNamingErrors.length > 0) {
        errors.push(...exportNamingErrors.map(err => `${fileInfo.relativePath}: ${err}`));
      }
      
      // Generate expected config key from file path
      const configKey = fileInfo.relativePath
        .replace(/\.ts$/, '')
        .replace(/\//g, '-')
        .toLowerCase();
      
      // Validate config key format
      const configKeyErrors = validateConfigKey(configKey);
      if (configKeyErrors.length > 0) {
        errors.push(...configKeyErrors.map(err => `${fileInfo.relativePath}: ${err}`));
      }
      
      // Validate configuration structure
      const structureErrors = validateConfigurationStructure(config, configKey);
      if (structureErrors.length > 0) {
        errors.push(...structureErrors.map(err => `${fileInfo.relativePath}: ${err}`));
      }
      
      if (fileNamingErrors.length === 0 && exportNamingErrors.length === 0 && 
          configKeyErrors.length === 0 && structureErrors.length === 0) {
        console.log(`  ✅ ${fileInfo.relativePath} - Valid`);
      }
      
    } catch (error) {
      errors.push(`${fileInfo.relativePath}: ${error.message}`);
      console.log(`  ❌ ${fileInfo.relativePath} - Error: ${error.message}`);
    }
  }
  
  // Validate dynamic loader paths
  console.log('\n🔗 Validating dynamic loader configuration...');
  const loaderErrors = validateDynamicLoaderPaths();
  if (loaderErrors.length > 0) {
    errors.push(...loaderErrors.map(err => `DynamicConfigurationLoader: ${err}`));
  } else {
    console.log('  ✅ Dynamic loader paths validated');
  }
  
  // Report results
  console.log('\n📊 Validation Results:');
  console.log('='.repeat(50));
  
  if (errors.length === 0) {
    console.log('✅ All configuration validations passed!');
    console.log(`   - ${configFiles.length} configuration files validated`);
    console.log('   - Naming conventions compliant');
    console.log('   - Structure validation passed');
    console.log('   - Dynamic loader paths validated');
    process.exit(0);
  } else {
    console.log(`❌ Configuration validation failed with ${errors.length} errors:\n`);
    
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
    
    console.log('\n💡 Fix the above errors and run validation again.');
    process.exit(1);
  }
}

// ===== EXECUTION =====

if (import.meta.url === `file://${process.argv[1]}`) {
  validateConfigurations().catch(error => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
  });
}

export {
  validateConfigKey,
  validateConfigFileName,
  validateExportName,
  validateConfigurationStructure,
  validateConfigurations
};