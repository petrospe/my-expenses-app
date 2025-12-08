const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'src', 'data');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist'))); // Serve built React app

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper function to read JSON file
const readJSONFile = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

// Helper function to write JSON file
const writeJSONFile = (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

// API Routes

// Get all expenses
app.get('/api/expenses', (req, res) => {
  try {
    const expenses = readJSONFile('expenses.json');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load expenses' });
  }
});

// Get single expense by ID
app.get('/api/expenses/:id', (req, res) => {
  try {
    const expenses = readJSONFile('expenses.json');
    const expense = expenses.find(e => e.id === parseInt(req.params.id));
    if (expense) {
      res.json(expense);
    } else {
      res.status(404).json({ error: 'Expense not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to load expense' });
  }
});

// Create new expense
app.post('/api/expenses', (req, res) => {
  try {
    const expenses = readJSONFile('expenses.json');
    const newExpense = {
      id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
      code: req.body.code || '',
      category: req.body.category || '',
      description: req.body.description || '',
      column: parseInt(req.body.column) || 14,
      amount: parseFloat(req.body.amount) || 0,
      date: req.body.date || new Date().toISOString().split('T')[0]
    };

    expenses.push(newExpense);
    
    if (writeJSONFile('expenses.json', expenses)) {
      res.status(201).json(newExpense);
    } else {
      res.status(500).json({ error: 'Failed to save expense' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
app.put('/api/expenses/:id', (req, res) => {
  try {
    const expenses = readJSONFile('expenses.json');
    const index = expenses.findIndex(e => e.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    expenses[index] = {
      ...expenses[index],
      ...req.body,
      id: expenses[index].id // Don't allow ID changes
    };

    if (writeJSONFile('expenses.json', expenses)) {
      res.json(expenses[index]);
    } else {
      res.status(500).json({ error: 'Failed to update expense' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  try {
    const expenses = readJSONFile('expenses.json');
    const filtered = expenses.filter(e => e.id !== parseInt(req.params.id));
    
    if (filtered.length === expenses.length) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (writeJSONFile('expenses.json', filtered)) {
      res.json({ message: 'Expense deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Sync expenses from localStorage (bulk save)
app.post('/api/expenses/sync', (req, res) => {
  try {
    const expenses = req.body.expenses || [];
    
    if (!Array.isArray(expenses)) {
      return res.status(400).json({ error: 'Expenses must be an array' });
    }

    if (writeJSONFile('expenses.json', expenses)) {
      res.json({ 
        message: 'Expenses synced successfully',
        count: expenses.length 
      });
    } else {
      res.status(500).json({ error: 'Failed to sync expenses' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync expenses' });
  }
});

// Tenants

// Get all tenants
app.get('/api/tenants', (req, res) => {
  try {
    const tenants = readJSONFile('tenants.json');
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load tenants' });
  }
});

// Get single tenant by ID
app.get('/api/tenants/:id', (req, res) => {
  try {
    const tenants = readJSONFile('tenants.json');
    const tenant = tenants.find(t => t.id === parseInt(req.params.id));
    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).json({ error: 'Tenant not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to load tenant' });
  }
});

// Create new tenant
app.post('/api/tenants', (req, res) => {
  try {
    const tenants = readJSONFile('tenants.json');
    const newTenant = {
      id: tenants.length > 0 ? Math.max(...tenants.map(t => t.id)) + 1 : 1,
      code: req.body.code || '',
      floor: req.body.floor || '',
      area: parseFloat(req.body.area) || 0,
      owner: req.body.owner || { name: '', phone: '', mobile: '' },
      tenant: req.body.tenant || { name: '', phone: '', mobile: '' },
      coefficients: req.body.coefficients || {
        elevator: 0,
        heating: 0,
        common: 0,
        equal: 0,
        fi: 0,
        emergency: 0,
        ei: 0
      }
    };

    tenants.push(newTenant);
    
    if (writeJSONFile('tenants.json', tenants)) {
      res.status(201).json(newTenant);
    } else {
      res.status(500).json({ error: 'Failed to save tenant' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// Update tenant
app.put('/api/tenants/:id', (req, res) => {
  try {
    const tenants = readJSONFile('tenants.json');
    const index = tenants.findIndex(t => t.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    tenants[index] = {
      ...tenants[index],
      ...req.body,
      id: tenants[index].id, // Don't allow ID changes
      coefficients: req.body.coefficients || tenants[index].coefficients
    };

    if (writeJSONFile('tenants.json', tenants)) {
      res.json(tenants[index]);
    } else {
      res.status(500).json({ error: 'Failed to update tenant' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

// Delete tenant
app.delete('/api/tenants/:id', (req, res) => {
  try {
    const tenants = readJSONFile('tenants.json');
    const filtered = tenants.filter(t => t.id !== parseInt(req.params.id));
    
    if (filtered.length === tenants.length) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (writeJSONFile('tenants.json', filtered)) {
      res.json({ message: 'Tenant deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete tenant' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

// Get heating data
app.get('/api/heating', (req, res) => {
  try {
    const heating = readJSONFile('heating.json');
    res.json(heating);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load heating data' });
  }
});

// Get building info
app.get('/api/building', (req, res) => {
  try {
    const building = readJSONFile('building.json');
    res.json(building);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load building info' });
  }
});

// Update building info
app.put('/api/building', (req, res) => {
  try {
    const buildingData = req.body;
    
    if (writeJSONFile('building.json', buildingData)) {
      res.json(buildingData);
    } else {
      res.status(500).json({ error: 'Failed to update building info' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update building info' });
  }
});

// Calculation Periods

// Get all calculation periods
app.get('/api/calculation-periods', (req, res) => {
  try {
    const periods = readJSONFile('calculationPeriods.json');
    res.json(periods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load calculation periods' });
  }
});

// Create calculation period
app.post('/api/calculation-periods', (req, res) => {
  try {
    const periods = readJSONFile('calculationPeriods.json');
    const expenses = readJSONFile('expenses.json');
    
    const newPeriod = {
      id: req.body.id || Date.now(),
      name: req.body.name,
      date: req.body.date || new Date().toISOString().split('T')[0],
      expenseIds: req.body.expenseIds || [],
      totalAmount: req.body.totalAmount || 0,
      tenantPayments: req.body.tenantPayments || [],
      createdAt: req.body.createdAt || new Date().toISOString()
    };

    // Update expenses with periodId
    const updatedExpenses = expenses.map(exp => {
      if (newPeriod.expenseIds.includes(exp.id)) {
        return { ...exp, periodId: newPeriod.id };
      }
      return exp;
    });

    periods.push(newPeriod);
    
    if (writeJSONFile('calculationPeriods.json', periods) && 
        writeJSONFile('expenses.json', updatedExpenses)) {
      res.status(201).json(newPeriod);
    } else {
      res.status(500).json({ error: 'Failed to save calculation period' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create calculation period' });
  }
});

// Delete calculation period
app.delete('/api/calculation-periods/:id', (req, res) => {
  try {
    const periods = readJSONFile('calculationPeriods.json');
    const expenses = readJSONFile('expenses.json');
    const periodId = parseInt(req.params.id);
    
    const period = periods.find(p => p.id === periodId);
    if (!period) {
      return res.status(404).json({ error: 'Period not found' });
    }

    // Remove periodId from expenses
    const updatedExpenses = expenses.map(exp => {
      if (exp.periodId === periodId) {
        const { periodId, ...expenseWithoutPeriod } = exp;
        return expenseWithoutPeriod;
      }
      return exp;
    });

    const filteredPeriods = periods.filter(p => p.id !== periodId);
    
    if (writeJSONFile('calculationPeriods.json', filteredPeriods) &&
        writeJSONFile('expenses.json', updatedExpenses)) {
      res.json({ message: 'Period deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete period' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete period' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes (catch-all must be last)
// Only serve React app if dist folder exists (production build)
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  app.get('/*', (req, res) => {
    // Don't serve React app for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

