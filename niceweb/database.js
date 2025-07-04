// Database connection pool (PostgreSQL example)
const { Pool } = require("pg");

// Pool configuration with environment variable support and sensible defaults
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 20,
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT ? parseInt(process.env.DB_IDLE_TIMEOUT, 10) : 30000,
  connectionTimeoutMillis: process.env.DB_CONN_TIMEOUT ? parseInt(process.env.DB_CONN_TIMEOUT, 10) : 2000,
});

// Log pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err);
});

// Graceful shutdown
const shutdownPool = () => {
  pool.end(() => {
    console.log("PostgreSQL pool has ended");
    process.exit(0);
  });
};

process.on("SIGINT", shutdownPool);
process.on("SIGTERM", shutdownPool);

module.exports = pool;
