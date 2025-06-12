import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

// Inicializamos Supabase
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  const body = await request.json();

  console.log("Webhook recibido:", body);

  // Enviar por WhatsApp
  const phone = process.env.WHATSAPP_PHONE;
  const apikey = process.env.WHATSAPP_API_KEY;

  if (!phone || !apikey) {
    console.error("❌ Número o API Key no definidos en variables de entorno");
    return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });
  }

  const message = encodeURIComponent(`📬 Webhook recibido!\n\n${JSON.stringify(body, null, 2)}`);

  try {
    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${message}&apikey=${apikey}`);
  } catch (error) {
    console.error("❌ Error enviando mensaje a WhatsApp:", error);
  }

  // Guardar en Supabase
  const { error } = await supabase.from("webhook_logs").insert([
    { payload: body }, // Asumiendo que tenés una columna 'payload' de tipo jsonb
  ]);

  if (error) {
    console.error("❌ Error guardando el webhook en Supabase:", error);
    return NextResponse.json({ error: "Error guardando el webhook" }, { status: 500 });
  }

  return NextResponse.json({ message: "Webhook recibido con éxito" });
}
