const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

// GET /api/readings?anonymous_id=xxx&limit=20
export async function onRequestGet(context: any) {
  try {
    const url = new URL(context.request.url);
    const anonymousId = url.searchParams.get("anonymous_id");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const db = context.env.DB;

    let result;
    if (anonymousId) {
      result = await db.prepare(
        `SELECT * FROM tarot_readings WHERE anonymous_id = ? ORDER BY created_at DESC LIMIT ?`
      ).bind(anonymousId, limit).all();
    } else {
      result = await db.prepare(
        `SELECT * FROM tarot_readings ORDER BY created_at DESC LIMIT ?`
      ).bind(limit).all();
    }

    return new Response(JSON.stringify(result.results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// POST /api/readings  (单条或批量插入)
export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json();
    const db = context.env.DB;

    const records = Array.isArray(body) ? body : [body];

    const stmt = db.prepare(
      `INSERT OR REPLACE INTO tarot_readings
        (id, created_at, card_name, is_reversed, spread_type, anonymous_id,
         question, city_alias, position_label, reading_id, reading_text,
         is_manual_mode, click_donate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const inserts = records.map((r: any) =>
      stmt.bind(
        r.id,
        r.created_at || new Date().toISOString(),
        r.card_name || null,
        r.is_reversed ? 1 : 0,
        r.spread_type || null,
        r.anonymous_id || null,
        r.question || null,
        r.city_alias || null,
        r.position_label || null,
        r.reading_id || null,
        r.reading_text || null,
        r.is_manual_mode ? 1 : 0,
        r.click_donate ? 1 : 0
      )
    );

    await db.batch(inserts);

    return new Response(JSON.stringify({ success: true, count: records.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
