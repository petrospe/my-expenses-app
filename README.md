# Εφαρμογή Διαχείρισης Κοινοχρήστων Πολυκατοικίας

React Router εφαρμογή για τη διαχείριση κοινοχρήστων πολυκατοικίας, βασισμένη σε δεδομένα από Excel αρχείο.

## Δομή Αρχείων

```
my-expenses-app/
├── public/
│   └── index.html               # Κύριο αρχείο HTML
├── src/
│   ├── components/
│   │   ├── Header.js            # Κεφαλίδα / Πλοήγηση
│   │   ├── Navigation.js        # Συστατικό πλοήγησης
│   │   └── ExpenseList.js       # Συστατικό για εμφάνιση λίστας εξόδων
│   ├── pages/
│   │   ├── Home.js              # Αρχική Σελίδα (/)
│   │   ├── Expenses.js          # Σελίδα Διαχείρισης Εξόδων (/expenses)
│   │   ├── Tenants.js           # Σελίδα Διαχείρισης Διαμερισμάτων/Ενοίκων (/tenants)
│   │   └── Calculate.js         # Σελίδα Υπολογισμού Κοινοχρήστων (/calculate)
│   ├── data/
│   │   ├── expenses.json        # Δεδομένα εξόδων
│   │   ├── tenants.json         # Δεδομένα διαμερισμάτων/ενοίκων
│   │   ├── heating.json         # Δεδομένα θέρμανσης
│   │   └── building.json        # Γενικά στοιχεία κτιρίου
│   ├── App.js                   # Κύριο συστατικό (Ρύθμιση React Router)
│   ├── index.js                 # Entry point της εφαρμογής
│   └── index.css                # Γενικό CSS
├── package.json                 # Εξαρτήσεις και scripts
└── README.md
```

## Εγκατάσταση

```bash
npm install
```

## Εκτέλεση

Για development server:

```bash
npm run dev
```

Για production build:

```bash
npm run build
```

Για preview του production build:

```bash
npm run preview
```

## Χαρακτηριστικά

- **Αρχική Σελίδα**: Επισκόπηση στατιστικών και γενικών πληροφοριών
- **Διαχείριση Δαπανών**: Προβολή και αναζήτηση όλων των δαπανών
- **Διαχείριση Διαμερισμάτων**: Προβολή πληροφοριών για κάθε διαμέρισμα, ιδιοκτήτη και ένοικο
- **Υπολογισμός Κοινοχρήστων**: Αυτόματος υπολογισμός κατανομής δαπανών ανά διαμέρισμα

## Τεχνολογίες

- React 18
- React Router DOM 6
- Vite
- CSS3 (Responsive Design)

## Σημειώσεις

Τα δεδομένα έχουν εξαχθεί από το αρχείο Excel `0-Kinohrista_Fotis-mehri_22_diam.-Orometrisi-TEST.xlsx` και αποθηκεύονται σε JSON αρχεία στον φάκελο `src/data/`.




