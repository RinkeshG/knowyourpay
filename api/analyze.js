export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'Server missing API key',
      message: 'Add ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables, then redeploy.'
    });
  }

  try {
    const body = req.body || {};
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg = data.error?.message || data.message || data.error || `API error ${response.status}`;
      return res.status(response.status).json({
        error: typeof data.error === 'object' ? data.error : { message: msg },
        message: msg
      });
    }
    if (data.error) {
      return res.status(400).json({
        error: data.error,
        message: data.error?.message || 'Invalid response from AI'
      });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Analyze API error:', err);
    res.status(500).json({
      error: 'Analysis request failed',
      message: err.message || 'Network or server error. Try again.'
    });
  }
}