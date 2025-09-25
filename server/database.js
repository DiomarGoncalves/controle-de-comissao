import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS commissions (
        id SERIAL PRIMARY KEY,
        nf_number VARCHAR(255),
        order_number_nectar VARCHAR(255),
        order_number_embrascol VARCHAR(255),
        value_nf DECIMAL(10,2) NOT NULL,
        factor DECIMAL(5,4) DEFAULT 0.025,
        commission_value DECIMAL(10,2) NOT NULL,
        is_paid BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create trigger for auto-updating commission_value and updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_commission_value()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.commission_value = NEW.value_nf * NEW.factor;
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_update_commission ON commissions;
      CREATE TRIGGER trigger_update_commission
        BEFORE INSERT OR UPDATE ON commissions
        FOR EACH ROW
        EXECUTE FUNCTION update_commission_value();
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export { pool, initDatabase };