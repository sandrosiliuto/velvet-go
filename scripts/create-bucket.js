const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://edawyshrkzhcnofchcyz.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkYXd5c2hya3poY25vZmNoY3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE5NzA5OSwiZXhwIjoyMDk0NzczMDk5fQ.hVJayTLHEXQPFpYI84KObvzw3uCaBmDzCGoRs1d22Ys";

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Error listando buckets:", listError);
    process.exit(1);
  }

  const exists = buckets.some((b) => b.id === "velvet-photos");
  if (exists) {
    console.log("Bucket 'velvet-photos' ya existe.");
    const { error: updateError } = await supabase.storage.updateBucket("velvet-photos", {
      public: true,
    });
    if (updateError) {
      console.error("Error actualizando bucket:", updateError);
      process.exit(1);
    }
    console.log("Bucket actualizado a público.");
    return;
  }

  const { data, error } = await supabase.storage.createBucket("velvet-photos", {
    public: true,
    fileSizeLimit: 5242880, // 5 MB
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });

  if (error) {
    console.error("Error creando bucket:", error);
    process.exit(1);
  }

  console.log("Bucket 'velvet-photos' creado:", data);
}

main();
