import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Support both DATABASE_URL (production/Neon) and individual params (local dev)
let pool;

if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
} else {
    pool = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
    });
}

pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);

export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL');
        client.release();
    } catch (err) {
        console.error('Failed to connect to PostgreSQL:', err);
        process.exit(1);
    }
};
