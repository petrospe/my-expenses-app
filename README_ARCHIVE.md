# Αρχείο & Εξαγωγή Δεδομένων

## Επισκόπηση

Το σύστημα αρχειοθέτησης επιτρέπει την αυτόματη ή χειροκίνητη αρχειοθέτηση όλων των δεδομένων κάθε μήνα και την εξαγωγή τους σε JSON ή Excel.

## Χαρακτηριστικά

### 1. Αρχείο Σελίδα (Web Interface)
- Προβολή όλων των αρχειοθετημένων μηνών
- Χειροκίνητη αρχειοθέτηση τρέχοντος μήνα
- Εξαγωγή αρχείων σε JSON
- Προβολή λεπτομερειών κάθε αρχείου

**Πρόσβαση:** Ναυσιάστε στο `/archive` ή κάντε κλικ στο "Αρχείο" στο μενού.

### 2. Monthly Archive Script
Αυτόματη αρχειοθέτηση μέσω script.

**Χρήση:**
```bash
cd /home/petros/public_html/courses/my-expenses-app
node scripts/monthly-archive.js
```

**Αυτόματη Εκτέλεση (Cron):**
```bash
# Εγκατάσταση cron job (τρέχει 1η κάθε μήνα στις 2:00 π.μ.)
./scripts/setup-cron.sh

# Προβολή cron jobs
crontab -l

# Χειροκίνητη εκτέλεση
node scripts/monthly-archive.js
```

### 3. Excel Export Script
Εξαγωγή αρχείου σε Excel format.

**Χρήση:**
```bash
# Εξαγωγή τρέχοντος μήνα
node scripts/export-to-excel.js

# Εξαγωγή συγκεκριμένου μήνα
node scripts/export-to-excel.js 2024-12
```

## Δομή Αρχείων

```
my-expenses-app/
├── archives/              # Αρχειοθετημένα JSON αρχεία
│   ├── archive_2024-12_2024-12-03.json
│   └── summary_2024-12.json
├── exports/               # Εξαγόμενα Excel αρχεία
│   └── export_2024-12_2024-12-03.xlsx
├── logs/                  # Logs από cron jobs
│   └── archive.log
└── scripts/
    ├── monthly-archive.js    # Script αρχειοθέτησης
    ├── export-to-excel.js    # Script εξαγωγής Excel
    └── setup-cron.sh          # Εγκατάσταση cron job
```

## Δεδομένα που Αρχειοθετούνται

Κάθε αρχείο περιέχει:
- **Expenses** - Όλες οι δαπάνες
- **Tenants** - Όλα τα διαμερίσματα και οι ένοικοι
- **Heating** - Δεδομένα θέρμανσης
- **Building** - Γενικά στοιχεία κτιρίου
- **Summary** - Σύνοψη με στατιστικά

## Χρήση Web Interface

1. **Αρχειοθέτηση:**
   - Μεταβείτε στη σελίδα "Αρχείο"
   - Κάντε κλικ στο "Αρχειοθέτηση Τρέχοντος Μήνα"
   - Το αρχείο θα αποθηκευτεί στο localStorage

2. **Εξαγωγή:**
   - Επιλέξτε ένα αρχείο από τη λίστα
   - Κάντε κλικ στο "Εξαγωγή JSON" για λήψη
   - Χρησιμοποιήστε το script για Excel export

3. **Προβολή:**
   - Κάντε κλικ στο "Προβολή" για να δείτε λεπτομέρειες

## Cron Job Setup

Για αυτόματη αρχειοθέτηση κάθε μήνα:

```bash
cd /home/petros/public_html/courses/my-expenses-app
./scripts/setup-cron.sh
```

Αυτό θα δημιουργήσει ένα cron job που τρέχει την 1η κάθε μήνα στις 2:00 π.μ.

## Σημειώσεις

- Τα αρχεία αποθηκεύονται στο `localStorage` για web interface
- Τα scripts αποθηκεύουν αρχεία στο filesystem (`archives/` και `exports/`)
- Κάθε αρχείο έχει μοναδικό ID: `YYYY-MM`
- Τα αρχεία δεν αντικαθιστούν τα τρέχοντα δεδομένα




