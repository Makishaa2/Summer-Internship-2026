import { Router } from 'express';
import {
  getUser,
  updateUser,
  getTransactions,
  addTransaction,
  deleteTransaction,
  getBudgets,
  setBudget,
  getGoals,
  addGoal,
  allocateGoal,
  deleteGoal,
  getFullState,
  resetDatabase
} from './db.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Full state endpoint - convenient for single fetch on app launch
router.get('/state', (req, res) => {
  try {
    const state = getFullState();
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User profile endpoints
router.get('/user', (req, res) => {
  try {
    res.json(getUser());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/user', (req, res) => {
  try {
    const { name, currency } = req.body;
    const user = updateUser({ name, currency });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/profile', (req, res) => {
  try {
    const { name, currency } = req.body;
    const user = updateUser({ name, currency });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transaction endpoints
router.get('/transactions', (req, res) => {
  try {
    res.json(getTransactions());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/transactions', (req, res) => {
  try {
    const { id, amount, type, category, date, description } = req.body;
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    const tx = addTransaction({ id, amount, type, category, date, description });
    res.status(201).json(tx);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = deleteTransaction(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Budget endpoints
router.get('/budgets', (req, res) => {
  try {
    res.json(getBudgets());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/budgets/:category', (req, res) => {
  try {
    const { category } = req.params;
    const { amount } = req.body;
    const result = setBudget(category, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/budgets', (req, res) => {
  try {
    const { category, amount } = req.body;
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    const result = setBudget(category, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Goal endpoints
router.get('/goals', (req, res) => {
  try {
    res.json(getGoals());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/goals', (req, res) => {
  try {
    const { id, name, target, saved } = req.body;
    if (!name || !target) {
      return res.status(400).json({ error: 'Name and target are required' });
    }
    const goal = addGoal({ id, name, target, saved });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/goals/:id/allocate', (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const updated = allocateGoal(id, amount);
    if (!updated) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/goals/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = deleteGoal(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset demo data endpoint
router.post('/reset', (req, res) => {
  try {
    const state = resetDatabase();
    res.json({ success: true, state });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
