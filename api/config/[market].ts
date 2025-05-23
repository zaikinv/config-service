import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from 'contentful';

const client = createClient({
  space: 'pe4od65qd3eb',
  environment: 'master',
  accessToken: process.env.CONTENTFUL_TOKEN!,
});

function unwrapFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(unwrapFields);
  }

  if (obj?.sys?.type === 'Link') {
    // unresolved link → skip
    return null;
  }

  if (obj?.fields) {
    return unwrapFields(obj.fields);
  }

  if (typeof obj === 'object' && obj !== null) {
    const out: any = {};
    for (const key of Object.keys(obj)) {
      out[key] = unwrapFields(obj[key]);
    }
    return out;
  }

  return obj;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { market } = req.query;

  if (typeof market !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid market param' });
  }

  try {
    const entries = await client.getEntries({
      content_type: 'marketConfig',
      'fields.id': market,
      include: 2,
      limit: 1,
    });

    if (!entries.items.length) {
      return res.status(404).json({ error: 'Market config not found' });
    }

    const raw = entries.items[0].fields;
    const result = unwrapFields(raw);

    return res.status(200).json(result);
  } catch (err) {
    console.error('BFF error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
