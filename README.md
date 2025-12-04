# Εφαρμογή Διαχείρισης Κοινοχρήστων Πολυκατοικίας

React Router εφαρμογή για τη διαχείριση κοινοχρήστων πολυκατοικίας με backend API για διαχείριση δεδομένων.

## Δομή Αρχείων

```
my-expenses-app/
├── public/
│   └── index.html                    # Κύριο αρχείο HTML
├── src/
│   ├── components/
│   │   ├── Header.jsx                # Κεφαλίδα / Πλοήγηση
│   │   ├── Navigation.jsx            # Συστατικό πλοήγησης
│   │   ├── ExpenseList.jsx           # Συστατικό για εμφάνιση λίστας εξόδων
│   │   ├── EditExpenseModal.jsx      # Modal για επεξεργασία εξόδων
│   │   ├── TenantFormModal.jsx       # Modal για διαχείριση διαμερισμάτων
│   │   └── AutocompleteInput.jsx     # Συστατικό αυτόματης συμπλήρωσης
│   ├── pages/
│   │   ├── Home.jsx                  # Αρχική Σελίδα (/)
│   │   ├── Expenses.jsx              # Σελίδα Διαχείρισης Εξόδων (/expenses)
│   │   ├── AddExpense.jsx            # Σελίδα Προσθήκης Εξόδου (/add-expense)
│   │   ├── Tenants.jsx               # Σελίδα Διαχείρισης Διαμερισμάτων/Ενοίκων (/tenants)
│   │   ├── Calculate.jsx             # Σελίδα Υπολογισμού Κοινοχρήστων (/calculate)
│   │   ├── Archive.jsx               # Σελίδα Αρχείου (/archive)
│   │   └── ViewLocalStorage.jsx      # Προβολή LocalStorage δεδομένων
│   ├── data/
│   │   ├── expenses.json             # Δεδομένα εξόδων
│   │   ├── tenants.json              # Δεδομένα διαμερισμάτων/ενοίκων
│   │   ├── heating.json              # Δεδομένα θέρμανσης
│   │   ├── building.json             # Γενικά στοιχεία κτιρίου
│   │   └── calculationPeriods.json   # Περιόδους υπολογισμού
│   ├── services/
│   │   └── api.js                    # API service layer
│   ├── App.jsx                       # Κύριο συστατικό (Ρύθμιση React Router)
│   ├── index.jsx                     # Entry point της εφαρμογής
│   └── index.css                     # Γενικό CSS
├── server.js                         # Express backend server
├── package.json                      # Εξαρτήσεις και scripts
└── README.md
```

## Εγκατάσταση

```bash
npm install
```

## Εκτέλεση

### Development Mode

Για frontend μόνο (με localStorage fallback):
```bash
npm run dev
```

Για backend server μόνο:
```bash
npm run dev:backend
```

Για frontend και backend μαζί:
```bash
npm run dev:full
```

### Production Build

Για build:
```bash
npm run build
```

Για preview του production build:
```bash
npm run preview
```

Για production server (serves built app + API):
```bash
npm start
```

## Χαρακτηριστικά

- **Αρχική Σελίδα**: Επισκόπηση στατιστικών και γενικών πληροφοριών
- **Διαχείριση Δαπανών**: Προβολή, προσθήκη, επεξεργασία και αναζήτηση όλων των δαπανών
- **Διαχείριση Διαμερισμάτων**: Προβολή και διαχείριση πληροφοριών για κάθε διαμέρισμα, ιδιοκτήτη και ένοικο
- **Υπολογισμός Κοινοχρήστων**: Αυτόματος υπολογισμός κατανομής δαπανών ανά διαμέρισμα
- **Αρχείο**: Προβολή αρχειοθετημένων δεδομένων
- **Backend API**: REST API για διαχείριση δεδομένων με αυτόματη συγχρονισμό σε JSON αρχεία

## Τεχνολογίες

- **Frontend**:
  - React 18
  - React Router DOM 6
  - Vite
  - CSS3 (Responsive Design)

- **Backend**:
  - Node.js
  - Express
  - CORS

## Backend API

Η εφαρμογή περιλαμβάνει Express backend server που παρέχει REST API endpoints. Για περισσότερες πληροφορίες, δείτε το [README_BACKEND.md](./README_BACKEND.md).

### Βασικά Endpoints

- `GET /api/expenses` - Λήψη όλων των εξόδων
- `POST /api/expenses` - Δημιουργία νέας δαπάνης
- `PUT /api/expenses/:id` - Ενημέρωση δαπάνης
- `DELETE /api/expenses/:id` - Διαγραφή δαπάνης
- `GET /api/tenants` - Λήψη δεδομένων διαμερισμάτων
- `GET /api/heating` - Λήψη δεδομένων θέρμανσης
- `GET /api/building` - Λήψη γενικών στοιχείων κτιρίου

## Διαχείριση Δεδομένων

Τα δεδομένα αποθηκεύονται σε JSON αρχεία στον φάκελο `src/data/`. Το backend server συγχρονίζει αυτόματα τις αλλαγές σε αυτά τα αρχεία. Αν το backend δεν είναι διαθέσιμο, η εφαρμογή χρησιμοποιεί localStorage ως fallback.

## Περιβάλλον Ανάπτυξης

Η εφαρμογή υποστηρίζει environment variables μέσω `.env` αρχείου:

```
VITE_API_URL=http://localhost:3001/api
PORT=3001
```
