import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  console.log("Webhook recibido:", body);

  // Aquí puedes hacer lo que necesites con los datos

  return NextResponse.json({ message: "Webhook recibido con éxito" });
}

export async function GET() {
  return NextResponse.json({ message: "GET recibido" });
}
