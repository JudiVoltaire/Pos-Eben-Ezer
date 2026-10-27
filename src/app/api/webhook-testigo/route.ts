import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json({
        success: true,
        message: "Telegram bot no configurado aún en .env.local (ignorado de forma segura).",
      });
    }

    const { tipo, mensaje } = body;
    const text = `🚨 *POS EBEN EZER - CINTA TESTIGO*\n*Tipo:* ${tipo}\n\n${mensaje}`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error en webhook testigo:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
