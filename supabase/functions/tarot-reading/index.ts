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
    const { question, cardsText, spread } = await req.json();

    const rawKey = Deno.env.get("DEEPSEEK_API_KEY") || "";
    const DEEPSEEK_API_KEY = rawKey.replace(/[^\x20-\x7E]/g, "").trim();
    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const spreadLabel = spread === "single" ? "单牌指引" : spread === "trinity" ? "圣三角牌阵" : "凯尔特十字牌阵";

    const systemPrompt = `你是一位深邃的神秘主义塔罗大师，拥有数十年的占卜经验。你的语言充满哲学气息与治愈力量，专业而不市俗。

当前使用的牌阵为「${spreadLabel}」。请根据用户的问题和抽到的牌，给出不少于400字的深度解读。

解读格式要求——对每一张牌，必须包含以下三个部分：

【卡片象征】描述牌面图案在当前语境下的寓意。
【核心牌义】该牌在当前牌阵位置的直接含义。如果是逆位，请特别说明逆位代表的内在转化、阻碍或过度能量。
【生活指引】给用户的具体行动建议或心理疏导。

最后给出一段整体总结，将所有牌的能量融合，提供宏观的启示与方向。`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `我的问题是：「${question}」\n我抽到的牌是：${cardsText}\n请为我做深度解读。`,
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `DeepSeek API 错误 (${response.status}): ${errorText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
