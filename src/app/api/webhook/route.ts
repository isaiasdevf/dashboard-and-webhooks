// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//   const body = await request.json();

//   console.log("Webhook recibido:", body);
//   console.log("Tipo de dato recibido:", typeof body);
//   console.log("Contenido:", JSON.stringify(body, null, 2));

//   // Aquí puedes hacer lo que necesites con los datos

//   return NextResponse.json({ message: "Webhook recibido con éxito" });
// }

// export async function GET() {
//   return NextResponse.json({ message: "GET recibido" });
// }

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  console.log("Webhook recibido:", body);

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

  return NextResponse.json({ message: "Webhook recibido con éxito" });
}
