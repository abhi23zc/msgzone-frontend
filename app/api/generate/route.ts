import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request : Request) {
  const body = await request.json();
  const { useTemplate, businessName, features, customPrompt } = body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  let prompt = '';

  if (useTemplate) {
    prompt = `Generate a WhatsApp marketing message for a business called "${businessName}" that offers the following features: ${features}. Use emojis, keep it fun and sales-oriented, and end with a strong CTA.`;
  } else {
    prompt = customPrompt;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return Response.json({ message: text });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Gemini API failed." }), {
      status: 500,
    });
  }
}
