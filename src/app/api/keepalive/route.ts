// pages/api/keepalive.ts

import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

// Inicializa el cliente de Supabase
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    // Consulta mínima a Supabase para mantenerlo activo
    const { data, error } = await supabase.from("webhook_logs").select("id").limit(1);

    if (error) {
      console.error("Error al consultar Supabase:", error.message);
      return NextResponse.json({ alive: false, error: error.message }, { status: 500 });
    }

    // Respuesta exitosa
    return NextResponse.json({ alive: true, ping: new Date().toISOString() });
  } catch (err) {
    console.error("Error inesperado:", err);
    return NextResponse.json({ alive: false, error: "Unexpected error" }, { status: 500 });
  }
}
