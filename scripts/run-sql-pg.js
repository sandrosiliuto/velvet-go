const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Conexión directa a Supabase (necesita la contraseña de la base de datos)
const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("ERROR: Debes configurar la variable de entorno SUPABASE_DB_URL.");
  console.error("Obtén la connection string directa (Direct connection) en:");
  console.error("https://supabase.com/dashboard/project/edawyshrkzhcnofchcyz/settings/database");
  process.exit(1);
}

const sqlPath = path.join(__dirname, "..", "sql", "setup_completo.sql");

async function main() {
  const sql = fs.readFileSync(sqlPath, "utf-8");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Conectado a Supabase via pg (direct connection).");
    await client.query(sql);
    console.log("SQL ejecutado correctamente.");
  } catch (err) {
    console.error("Error ejecutando SQL:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
