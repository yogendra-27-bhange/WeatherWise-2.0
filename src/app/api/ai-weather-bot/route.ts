import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'No message provided.' }, { status: 400 });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
    }
    // Call Gemini API
    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });
    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return NextResponse.json({ error: 'Gemini API error: ' + err }, { status: 500 });
    }
    const geminiData = await geminiRes.json();
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not understand that.';
    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
} 