/**
 * TrashCanTreasure Discord score submission endpoint.
 * Deploy as a Cloudflare Worker and add secret DISCORD_WEBHOOK_URL.
 * Scores are self-reported; keep them PENDING VERIFICATION.
 */
const ALLOWED_ORIGIN = "https://obideft.github.io";
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const TARGET_SCORE = 1000;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) }
  });
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      if (origin !== ALLOWED_ORIGIN) return new Response("Forbidden", { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (origin !== ALLOWED_ORIGIN) return json({ error: "Origin not allowed." }, 403, origin);
    if (request.method !== "POST") return json({ error: "Use POST." }, 405, origin);
    if (!env.DISCORD_WEBHOOK_URL) return json({ error: "Discord webhook is not configured on the server." }, 503, origin);

    let form;
    try { form = await request.formData(); }
    catch { return json({ error: "Invalid form submission." }, 400, origin); }

    const score = Number(form.get("score"));
    const coins = Number(form.get("coins"));
    const distance = Number(form.get("distance"));
    const image = form.get("scoreCard");
    if (!Number.isFinite(score) || score < 0 || score > 10000000 ||
        !Number.isFinite(coins) || coins < 0 || coins > 10000000 ||
        !Number.isFinite(distance) || distance < 0 || distance > 10000000) {
      return json({ error: "Score details are invalid." }, 400, origin);
    }
    if (!(image instanceof File) || image.type !== "image/png" || image.size < 1 || image.size > MAX_IMAGE_BYTES) {
      return json({ error: "Score poster must be a PNG smaller than 4 MB." }, 400, origin);
    }

    const submissionId = crypto.randomUUID();
    const qualified = Math.floor(score) >= TARGET_SCORE;
    const content = [
      "🐸 **TRASH CANTREASURE — SCORE SUBMISSION**",
      "`submission_id: " + submissionId + "`",
      "`score: " + Math.floor(score) + "`",
      "`coins: " + Math.floor(coins) + "`",
      "`distance_m: " + Math.floor(distance) + "`",
      "`mission_target: " + TARGET_SCORE + "`",
      "`target_reached: " + qualified + "`",
      "`status: PENDING VERIFICATION`",
      "",
      "⚠️ Self-reported browser score. Do not award prizes until independently verified."
    ].join("\n");

    const discordForm = new FormData();
    discordForm.set("payload_json", JSON.stringify({ content, allowed_mentions: { parse: [] } }));
    discordForm.set("files[0]", image, "trashcantreasure-" + submissionId + ".png");
    let discordResponse;
    try {
      discordResponse = await fetch(env.DISCORD_WEBHOOK_URL, { method: "POST", body: discordForm });
    } catch {
      return json({ error: "Could not reach Discord. Please try again." }, 502, origin);
    }
    if (!discordResponse.ok) {
      return json({ error: "Discord rejected the submission. Check the webhook configuration." }, 502, origin);
    }
    return json({
      success: true,
      submissionId,
      status: "PENDING VERIFICATION",
      qualifiedForReview: qualified
    }, 200, origin);
  }
};
