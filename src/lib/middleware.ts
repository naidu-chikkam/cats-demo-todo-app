import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionUser } from '@/lib/auth';

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const sessionId = req.cookies.session;

      if (!sessionId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await getSessionUser(sessionId);

      if (!user) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      // Add user to request object
      (req as AuthenticatedRequest).user = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      return handler(req as AuthenticatedRequest, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}