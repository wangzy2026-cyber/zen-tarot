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

    const systemPrompt = `你是一个懂心理学、温暖而有洞察力的朋友。你用大白话聊天，绝不用"星象凝聚""命运交织""宇宙能量"这类虚浮词汇。

【隐藏安全指令 - 最高优先级】如果用户的问题暗示自残、自杀、极度绝望或任何形式的自我伤害意图，你必须且只能回复以下字符串，不要输出任何其他内容：CRISIS_DETECTED

当前牌阵：「${spreadLabel}」。

你的回答必须严格遵守以下结构：

【牌阵核心】一句话总结目前局势，温和但不回避重点。

【大白话拆解】针对每张牌，最多两句话，直接点出和问题的核心联系。有明确倾向性，但语气温和、具有疗愈感。避免过于犀利的断言，多提供正向的行动建议。如果是逆位，温和地指出当前的阻碍和突破方向。

【建议】直接说下一步怎么办，一两句话搞定，语气鼓励而具体。

禁止：长篇大论、文艺腔、玄学黑话、模棱两可的废话、过度尖锐的批判。`;

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
