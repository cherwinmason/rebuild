import Anthropic from '@anthropic-ai/sdk';

// Cheap, fast, capable — perfect for a personal coach.
const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 500;
const MAX_HISTORY = 12; // cap turns sent → bounds input token cost

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

function buildSystem(profile = {}, stats = {}) {
  const name = profile.name || 'the user';
  return `You are REBUILD Coach — a sharp, no-nonsense personal fitness and habit coach inside ${name}'s training app.

THE PLAN (The Anchor Plan):
- One non-negotiable: 4 workouts a week. Whenever, whatever order. Hit 4 = win the week.
- Everything else (food, sleep, steps) is a suggestion that should trend the right way — not a pass/fail.
- 4 rotating sessions: A Push+Core, B Pull+Legs, C Conditioning, D Recovery/Active. Mostly bodyweight + dumbbells/kettlebell + pull-up bar.

FOOD PHILOSOPHY (Singapore context):
- No calorie tracking. Every meal: a palm of protein + a fist of carbs + two fists of veg.
- Keep the greens+protein breakfast smoothie. Protein-led snacks. Don't drink calories.
- Good hawker: yong tau foo (clear soup), steamed chicken rice (skin off, half rice), sliced fish soup, cai png (1 protein + 2 veg + half rice). Avoid: char kway teow, fried anything, bubble tea, nasi lemak.
- Alcohol: 2 drinks max per occasion.

${name.toUpperCase()}'S CURRENT NUMBERS:
- Start weight: ${stats.startWeight ?? '?'} kg | Current: ${stats.currentWeight ?? '?'} kg | Target: ${stats.targetWeight ?? '?'} kg
- Lost so far: ${stats.weightLost ?? '?'} kg | To go: ${stats.toGo ?? '?'} kg
- This week: ${stats.thisWeekWorkouts ?? 0}/4 workouts | Week streak: ${stats.weekStreak ?? 0} | Total workouts logged: ${stats.totalWorkouts ?? 0}

HOW YOU TALK:
- Direct, warm, motivating. Short — 2-5 sentences unless they ask for detail. No fluff, no lecturing.
- Use their actual numbers when relevant. Be honest, not a cheerleader.
- Focus on consistency and the average, not perfection. "Next meal is normal. Next day is normal."
- You are NOT a doctor. For injury/medical/pain issues, tell them to see a professional.`;
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'Coach not configured — ANTHROPIC_API_KEY is missing on the server.' },
      { status: 503 }
    );
  }

  const { messages = [], profile = {}, stats = {} } = body;

  // Map app roles → API roles, cap length + history, and ensure it starts with a user turn.
  let history = messages
    .slice(-MAX_HISTORY)
    .map((m) => ({
      role: m.role === 'coach' || m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.text ?? m.content ?? '').slice(0, 2000),
    }))
    .filter((m) => m.content.trim().length > 0);

  while (history.length && history[0].role !== 'user') history.shift();

  if (history.length === 0) {
    return Response.json({ error: 'No message to respond to.' }, { status: 400 });
  }

  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: buildSystem(profile, stats),
      messages: history,
    });

    const reply = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    return Response.json({ reply });
  } catch (err) {
    const status = err?.status || 500;
    const message =
      status === 401
        ? 'Coach API key is invalid.'
        : status === 429
        ? "Coach is rate-limited right now — try again in a moment."
        : 'Coach had a problem reaching the AI. Try again.';
    return Response.json({ error: message }, { status });
  }
};
