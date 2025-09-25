import express from 'express';
import cors from 'cors';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { pool, initDatabase } from './database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database on startup
initDatabase();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [`https://${process.env.VERCEL_URL}`, 'http://localhost:5173']
    : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    domain: process.env.NODE_ENV === 'production' ? 'controle-de-comissao-opal.vercel.app' : undefined
  }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
};

// Routes

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (username === adminUsername && password === adminPassword) {
      req.session.user = { username: adminUsername };
      res.json({ success: true, user: { username: adminUsername } });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.json({ success: true });
  });
});

// Check auth status
app.get('/api/auth/check', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

// Commissions CRUD

// Get all commissions
app.get('/api/commissions', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = 'SELECT * FROM commissions';
    let params = [];
    
    if (status === 'paid') {
      query += ' WHERE is_paid = true';
    } else if (status === 'pending') {
      query += ' WHERE is_paid = false';
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({ error: 'Erro ao buscar comissões' });
  }
});

// Create commission
app.post('/api/commissions', requireAuth, async (req, res) => {
  try {
    const { nf_number, order_number_nectar, order_number_embrascol, value_nf, factor } = req.body;
    
    const query = `
      INSERT INTO commissions (nf_number, order_number_nectar, order_number_embrascol, value_nf, factor)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      nf_number || null,
      order_number_nectar || null,
      order_number_embrascol || null,
      parseFloat(value_nf),
      parseFloat(factor || 0.025)
    ];
    
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating commission:', error);
    res.status(500).json({ error: 'Erro ao criar comissão' });
  }
});

// Update commission
app.put('/api/commissions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    const query = `
      UPDATE commissions 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    values.push(parseInt(id));
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comissão não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating commission:', error);
    res.status(500).json({ error: 'Erro ao atualizar comissão' });
  }
});

// Delete commission
app.delete('/api/commissions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM commissions WHERE id = $1 RETURNING id', [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comissão não encontrada' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting commission:', error);
    res.status(500).json({ error: 'Erro ao deletar comissão' });
  }
});

// Export CSV
app.get('/api/commissions/export', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM commissions ORDER BY created_at DESC');
    const { Parser } = await import('json2csv');
    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Nº NF', value: 'nf_number' },
      { label: 'Pedido Nectar', value: 'order_number_nectar' },
      { label: 'Pedido Embrascol', value: 'order_number_embrascol' },
      { label: 'Valor NF', value: 'value_nf' },
      { label: 'Fator', value: 'factor' },
      { label: 'Comissão', value: 'commission_value' },
      { label: 'Status', value: 'is_paid' },
      { label: 'Criado em', value: 'created_at' }
    ];
    
    const opts = { 
      fields,
      header: true,
      delimiter: ';',
      transforms: [
        (item) => ({
          ...item,
          is_paid: item.is_paid ? 'Pago' : 'Pendente',
          created_at: new Date(item.created_at).toLocaleDateString('pt-BR'),
          value_nf: parseFloat(item.value_nf).toFixed(2),
          factor: parseFloat(item.factor).toFixed(4),
          commission_value: parseFloat(item.commission_value).toFixed(2)
        })
      ]
    };
    
    const parser = new Parser(opts);
    const csv = parser.parse(result.rows);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=comissoes.csv');
    res.send('\uFEFF' + csv); // BOM for Excel compatibility
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Erro ao exportar CSV' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});