import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionUser } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionId = req.cookies.session;

    if (!sessionId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await getSessionUser(sessionId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}