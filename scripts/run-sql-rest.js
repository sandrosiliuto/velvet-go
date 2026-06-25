const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://edawyshrkzhcnofchcyz.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkYXd5c2hya3poY25vZmNoY3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE5NzA5OSwiZXhwIjoyMDk0NzczMDk5fQ.hVJayTLHEXQPFpYI84KObvzw3uCaBmDzCGoRs1d22Ys";

const sqlPath = path.join(__dirname, "..", "sql", "setup_completo.sql");

async function main() {
  const sql = fs.readFileSync(sqlPath, "utf-8");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log("Intentando ejecutar SQL vía Supabase REST API (/rpc/...)...");
  console.log("NOTA: Supabase no expone un endpoint /sql sin autenticación.");

  // Método 1: Intentar RPC con extension pg_net (poco probable que exista)
  try {
    const { data, error } = await supabase.rpc("exec_sql", { query: sql });
    if (error) throw error;
    console.log("SQL ejecutado vía RPC:", data);
    return;
  } catch (err) {
    console.log("RPC exec_sql no disponible:", err.message);
  }

  // Método 2: Endpoint de Supabase Management API requiere token de acceso personal.
  console.log("\nNo se dispone de un endpoint REST SQL accesible con service_role key.");
  console.log("Se requiere una connection string directa de Postgres o ejecutar el SQL manualmente en el SQL Editor.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
