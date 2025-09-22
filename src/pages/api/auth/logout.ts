import { NextApiRequest, NextApiResponse } from 'next';
import { deleteSession } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionId = req.cookies.session;

    if (sessionId) {
      await deleteSession(sessionId);
    }

    // Clear cookie
    res.setHeader('Set-Cookie', [
      'session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
    ]);

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}