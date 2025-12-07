const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Expenses
  async getExpenses() {
    return this.request('/expenses');
  }

  async getExpense(id) {
    return this.request(`/expenses/${id}`);
  }

  async createExpense(expense) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  async updateExpense(id, expense) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    });
  }

  async deleteExpense(id) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  async syncExpenses(expenses) {
    return this.request('/expenses/sync', {
      method: 'POST',
      body: JSON.stringify({ expenses }),
    });
  }

  // Tenants
  async getTenants() {
    return this.request('/tenants');
  }

  async getTenant(id) {
    return this.request(`/tenants/${id}`);
  }

  async createTenant(tenant) {
    return this.request('/tenants', {
      method: 'POST',
      body: JSON.stringify(tenant),
    });
  }

  async updateTenant(id, tenant) {
    return this.request(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenant),
    });
  }

  async deleteTenant(id) {
    return this.request(`/tenants/${id}`, {
      method: 'DELETE',
    });
  }

  // Heating
  async getHeating() {
    return this.request('/heating');
  }

  // Building
  async getBuilding() {
    return this.request('/building');
  }

  async updateBuilding(building) {
    return this.request('/building', {
      method: 'PUT',
      body: JSON.stringify(building),
    });
  }

  // Calculation Periods
  async getCalculationPeriods() {
    return this.request('/calculation-periods');
  }

  async createCalculationPeriod(period) {
    return this.request('/calculation-periods', {
      method: 'POST',
      body: JSON.stringify(period),
    });
  }

  async deleteCalculationPeriod(id) {
    return this.request(`/calculation-periods/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();

