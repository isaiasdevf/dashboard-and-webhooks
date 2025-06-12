import { cookies } from "next/headers";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { DataTable } from "./data-table";

export default async function Page() {
  const supabase = createServerComponentClient({ cookies });

  const { data: webhookLogs, error } = await supabase
    .from("webhook_logs")
    .select("*")
    .order("created_at", { ascending: false });

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
