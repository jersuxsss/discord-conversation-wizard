#!/usr/bin/env node

/**
 * Pre-publish validation script
 * Runs before publishing to NPM to ensure everything is ready
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running pre-publish checks...\n');

let hasErrors = false;

// Check 1: Ensure dist/ exists
console.log('✓ Checking build output...');
if (!fs.existsSync(path.join(__dirname, '../dist'))) {
    console.error('❌ dist/ directory not found. Run `npm run build` first.');
    hasErrors = true;
} else {
    console.log('  ✅ Build output exists');
}

// Check 2: Ensure all required files exist
console.log('\n✓ Checking required files...');
const requiredFiles = ['README.md', 'LICENSE', 'package.json', 'CHANGELOG.md'];
for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(__dirname, '../', file))) {
        console.error(`❌ Missing required file: ${file}`);
        hasErrors = true;
    }
}
console.log('  ✅ All required files present');

// Check 3: Verify package.json
console.log('\n✓ Validating package.json...');
const pkg = require('../package.json');

if (!pkg.name) {
    console.error('❌ Package name missing');
    hasErrors = true;
}
if (!pkg.version) {
    console.error('❌ Package version missing');
    hasErrors = true;
}
if (!pkg.description) {
    console.error('❌ Package description missing');
    hasErrors = true;
}
if (!pkg.main || !fs.existsSync(path.join(__dirname, '../', pkg.main))) {
    console.error('❌ Main entry point missing or invalid');
    hasErrors = true;
}
if (!pkg.types || !fs.existsSync(path.join(__dirname, '../', pkg.types))) {
    console.error('❌ Type definitions missing or invalid');
    hasErrors = true;
}
console.log('  ✅ package.json is valid');

// Check 4: Run tests
console.log('\n✓ Running tests...');
try {
    execSync('npm test', { stdio: 'inherit' });
    console.log('  ✅ All tests passed');
} catch (error) {
    console.error('❌ Tests failed');
    hasErrors = true;
}

// Check 5: Run linter
console.log('\n✓ Running linter...');
try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('  ✅ No linting errors');
} catch (error) {
    console.error('❌ Linting failed');
    hasErrors = true;
}

// Check 6: Verify version hasn't been published
console.log('\n✓ Checking NPM version...');
try {
    const publishedVersion = execSync(`npm view ${pkg.name} version`, { encoding: 'utf8' }).trim();
    if (publishedVersion === pkg.version) {
        console.error(`❌ Version ${pkg.version} already published to NPM`);
        console.error('   Run `npm version patch|minor|major` to bump version');
        hasErrors = true;
    } else {
        console.log(`  ✅ Version ${pkg.version} is new (current: ${publishedVersion})`);
    }
} catch (error) {
    // Package doesn't exist yet, which is fine for first publish
    console.log('  ✅ Package not yet published (first release)');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.error('\n❌ Pre-publish checks FAILED');
    console.error('   Please fix the errors above before publishing.');
    process.exit(1);
} else {
    console.log('\n✅ All pre-publish checks PASSED');
    console.log('   Ready to publish with: npm publish');
}
