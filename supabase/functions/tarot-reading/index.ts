import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, cards } = await req.json();

    const rawKey = Deno.env.get("DEEPSEEK_API_KEY") || "";
    const DEEPSEEK_API_KEY = rawKey.replace(/[^\x20-\x7E]/g, "").trim();
    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const cardsText = cards
      .map((c: { name: string; nameCn: string }, i: number) => `第${i + 1}张：${c.nameCn}（${c.name}）`)
      .join("；");

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "你是一位极其简练、深邃的神秘主义塔罗大师。你的语言充满了哲学气息，不啰嗦，不市俗。你会根据用户的问题和抽到的三张牌，给出一段充满启示性的简短解读（100字以内）。",
          },
          {
            role: "user",
            content: `我的问题是：「${question}」\n我抽到的三张牌是：${cardsText}\n请为我解读。`,
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: `DeepSeek API 错误 (${response.status}): ${errorText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("tarot-reading error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
