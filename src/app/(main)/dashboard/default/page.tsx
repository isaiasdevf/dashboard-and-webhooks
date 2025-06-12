import { cookies } from "next/headers";

import { createClient } from "@supabase/supabase-js";

import { DataTable } from "./data-table";

export default async function Page() {
  // Crear cliente de Supabase con service_role key
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: webhookLogs, error } = await supabase
    .from("webhook_logs")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching webhook logs:", error);
    return <div>Error loading data</div>;
  }

  // Para debugging
  console.log("Raw webhook logs:", webhookLogs);

  // Asegurarnos de que los datos tengan la estructura correcta
  const transformedData = webhookLogs.map((log) => ({
    payload: log.payload,
  }));

  // Para debugging
  console.log("Transformed Data:", transformedData);

  return (
    <div className="container mx-auto py-10">
      <DataTable data={transformedData} />
    </div>
  );
}
