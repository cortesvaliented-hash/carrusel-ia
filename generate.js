exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { topic, platform, tone, numSlides } = body;

  if (!topic || !platform) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Faltan parámetros' }) };
  }

  const platformLabel = platform === 'instagram' ? 'Instagram' : 'LinkedIn';

  const systemPrompt = `Eres un experto en contenido viral para redes sociales, especializado en carruseles para ${platformLabel}.
Generas contenido en español, directo, sin relleno, con ganchos fuertes.
SIEMPRE responde SOLO con JSON válido, sin texto previo ni backticks.`;

  const userPrompt = `Crea un carrusel de ${numSlides} slides para ${platformLabel} sobre: "${topic}"
Tono: ${tone || 'Educativo'}

Estructura:
- Slide 1 (portada): eyebrow (categoría corta), headline (gancho máx 8 palabras), body (subtítulo 1 línea)
- Slides 2 a ${numSlides - 1}: eyebrow (punto/tip), headline (idea concisa), body (explicación 2-3 líneas)
- Slide ${numSlides} (cierre): headline (reflexión o promesa), body (1-2 líneas), cta (llamada a la acción corta)

Devuelve SOLO este JSON sin nada más:
{"slides":[{"eyebrow":"","headline":"","body":"","cta":""}]}
El campo "cta" solo en el último slide.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API error');
    }

    const raw = data.content?.map(b => b.text || '').join('').trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error generando el carrusel. Inténtalo de nuevo.' }),
    };
  }
};
