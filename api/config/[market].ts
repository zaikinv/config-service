import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from 'contentful';

const client = createClient({
  space: 'pe4od65qd3eb',
  environment: 'master',
  accessToken: process.env.CONTENTFUL_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { market } = req.query;

  try {
    const entries = await client.getEntries({
      content_type: 'marketConfig',
      'fields.market': market,
      limit: 1,
    });

    if (!entries.items.length) {
      return res.status(404).json({ error: 'Market config not found' });
    }

    const config = entries.items[0].fields;
    return res.status(200).json(config);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
