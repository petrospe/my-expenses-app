#!/usr/bin/env node

/**
 * Export Archive to Excel
 * 
 * Exports archived data to Excel format using xlsx library
 * 
 * Usage:
 *   node scripts/export-to-excel.js [archive-id]
 *   Example: node scripts/export-to-excel.js 2024-12
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ARCHIVE_DIR = path.join(__dirname, '../archives');
const EXPORT_DIR = path.join(__dirname, '../exports');

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

function exportArchiveToExcel(archiveId) {
  // Find archive file
  const archiveFiles = fs.readdirSync(ARCHIVE_DIR)
    .filter(f => f.startsWith(`archive_${archiveId}`) && f.endsWith('.json'));

  if (archiveFiles.length === 0) {
    console.error(`❌ Archive ${archiveId} not found!`);
    process.exit(1);
  }

  const archiveFile = archiveFiles[0];
  const archivePath = path.join(ARCHIVE_DIR, archiveFile);
  const archive = JSON.parse(fs.readFileSync(archivePath, 'utf8'));

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Expenses
  const expensesWS = XLSX.utils.json_to_sheet(archive.expenses);
  XLSX.utils.book_append_sheet(workbook, expensesWS, 'Δαπάνες');

  // Sheet 2: Tenants
  const tenantsData = archive.tenants.map(t => ({
    'Α/Α': t.id,
    'Κωδικός': t.code,
    'Όροφος': t.floor,
    'Εμβαδόν (m²)': t.area,
    'Ιδιοκτήτης': t.owner.name,
    'Τηλέφωνο Ιδιοκτήτη': t.owner.phone || '',
    'Κινητό Ιδιοκτήτη': t.owner.mobile || '',
    'Ένοικος': t.tenant.name,
    'Τηλέφωνο Ενοίκου': t.tenant.phone || '',
    'Κινητό Ενοίκου': t.tenant.mobile || '',
    'Συντελ. Ανελκυστήρας': t.coefficients.elevator,
    'Συντελ. Θέρμανση': t.coefficients.heating,
    'Συντελ. Κοινοχρήσιμα': t.coefficients.common,
  }));
  const tenantsWS = XLSX.utils.json_to_sheet(tenantsData);
  XLSX.utils.book_append_sheet(workbook, tenantsWS, 'Διαμερίσματα');

  // Sheet 3: Heating
  const heatingWS = XLSX.utils.json_to_sheet(archive.heating);
  XLSX.utils.book_append_sheet(workbook, heatingWS, 'Θέρμανση');

  // Sheet 4: Summary
  const summaryData = [{
    'Μήνας': archive.monthName,
    'Ημερομηνία Αρχειοθέτησης': new Date(archive.createdAt).toLocaleDateString('el-GR'),
    'Σύνολο Δαπανών (€)': archive.totalExpenses,
    'Αριθμός Δαπανών': archive.expenses.length,
    'Αριθμός Διαμερισμάτων': archive.tenants.length,
    'Αριθμός Εγγραφών Θέρμανσης': archive.heating.length,
  }];
  const summaryWS = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summaryWS, 'Σύνοψη');

  // Write file
  const excelFileName = `export_${archiveId}_${archive.date}.xlsx`;
  const excelPath = path.join(EXPORT_DIR, excelFileName);
  XLSX.writeFile(workbook, excelPath);

  console.log('✅ Excel export created successfully!');
  console.log(`   File: ${excelFileName}`);
  console.log(`   Location: ${excelPath}`);
  console.log(`   Sheets: Δαπάνες, Διαμερίσματα, Θέρμανση, Σύνοψη`);
}

// Get archive ID from command line or use current month
const archiveId = process.argv[2] || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

try {
  exportArchiveToExcel(archiveId);
} catch (error) {
  console.error('❌ Error exporting to Excel:', error);
  process.exit(1);
}








