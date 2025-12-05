#!/usr/bin/env node

/**
 * Monthly Archive Script
 * 
 * This script archives all current data (expenses, tenants, heating, building)
 * for the current month. It can be run manually or via cron job.
 * 
 * Usage:
 *   node scripts/monthly-archive.js
 * 
 * Cron example (runs on 1st of every month at 2 AM):
 *   0 2 1 * * cd /path/to/my-expenses-app && node scripts/monthly-archive.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const ARCHIVE_DIR = path.join(__dirname, '../archives');

// Ensure archive directory exists
if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return null;
  }
}

function createArchive() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const archiveKey = `${year}-${month}`;
  const archiveDate = `${year}-${month}-${day}`;
  
  // Load current data
  const expenses = loadJSON(path.join(DATA_DIR, 'expenses.json'));
  const tenants = loadJSON(path.join(DATA_DIR, 'tenants.json'));
  const heating = loadJSON(path.join(DATA_DIR, 'heating.json'));
  const building = loadJSON(path.join(DATA_DIR, 'building.json'));

  if (!expenses || !tenants || !heating || !building) {
    console.error('Failed to load all data files. Archive aborted.');
    process.exit(1);
  }

  // Calculate totals
  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + (parseFloat(exp.amount) || 0),
    0
  );

  // Create archive object
  const archive = {
    id: archiveKey,
    date: archiveDate,
    year,
    month: parseInt(month),
    monthName: now.toLocaleDateString('el-GR', { month: 'long', year: 'numeric' }),
    expenses,
    tenants,
    heating,
    building,
    totalExpenses,
    createdAt: now.toISOString(),
    archivedBy: 'monthly-archive-script'
  };

  // Save archive file
  const archiveFileName = `archive_${archiveKey}_${archiveDate}.json`;
  const archivePath = path.join(ARCHIVE_DIR, archiveFileName);
  
  fs.writeFileSync(
    archivePath,
    JSON.stringify(archive, null, 2),
    'utf8'
  );

  // Also create a summary file
  const summary = {
    id: archiveKey,
    date: archiveDate,
    monthName: archive.monthName,
    totalExpenses,
    expensesCount: expenses.length,
    tenantsCount: tenants.length,
    heatingRecordsCount: heating.length,
    createdAt: archive.createdAt
  };

  const summaryPath = path.join(ARCHIVE_DIR, `summary_${archiveKey}.json`);
  fs.writeFileSync(
    summaryPath,
    JSON.stringify(summary, null, 2),
    'utf8'
  );

  console.log('✅ Archive created successfully!');
  console.log(`   Month: ${archive.monthName}`);
  console.log(`   Total Expenses: ${totalExpenses.toFixed(2)} €`);
  console.log(`   Expenses: ${expenses.length}`);
  console.log(`   Tenants: ${tenants.length}`);
  console.log(`   Archive file: ${archiveFileName}`);
  console.log(`   Location: ${archivePath}`);

  return archive;
}

// Run archive
try {
  createArchive();
} catch (error) {
  console.error('❌ Error creating archive:', error);
  process.exit(1);
}








