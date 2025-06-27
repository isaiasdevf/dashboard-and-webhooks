// pages/api/keepalive.ts

import type { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@supabase/supabase-js";

// Inicializa el cliente de Supabase
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    // Consulta mínima a Supabase para mantenerlo activo
    const { data, error } = await supabase.from("webhook_logs").select("id").limit(1);

    if (error) {
      console.error("Error al consultar Supabase:", error.message);
      return res.status(500).json({ alive: false, error: error.message });
    }

    // Respuesta exitosa
    return res.status(200).json({ alive: true, ping: new Date().toISOString() });
  } catch (err) {
    console.error("Error inesperado:", err);
    return res.status(500).json({ alive: false, error: "Unexpected error" });
  }
}
