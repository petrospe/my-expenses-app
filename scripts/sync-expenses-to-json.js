#!/usr/bin/env node

/**
 * Sync Expenses from localStorage to JSON file
 * 
 * This script reads expenses from localStorage (via browser console) or
 * creates a script to export them from the browser.
 * 
 * Usage:
 *   1. Open browser console on the app
 *   2. Run: JSON.parse(localStorage.getItem('expenses'))
 *   3. Copy the output
 *   4. Or use the export function in the app
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const EXPENSES_FILE = path.join(DATA_DIR, 'expenses.json');

console.log('To sync expenses from localStorage to JSON:');
console.log('');
console.log('1. Open your browser console (F12)');
console.log('2. Run this command:');
console.log('   JSON.parse(localStorage.getItem("expenses"))');
console.log('3. Copy the output');
console.log('4. Save it to:', EXPENSES_FILE);
console.log('');
console.log('Or use the export feature in the Archive page to download the JSON file.');

// If you want to manually update, uncomment and provide the expenses array:
/*
const expenses = [
  // Paste your expenses array here
];

fs.writeFileSync(
  EXPENSES_FILE,
  JSON.stringify(expenses, null, 2),
  'utf8'
);

console.log(`✅ Updated ${EXPENSES_FILE} with ${expenses.length} expenses`);
*/





