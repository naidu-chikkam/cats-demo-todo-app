import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyPassword, createSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const sessionId = await createSession(user.id);

    // Set cookie
    res.setHeader('Set-Cookie', [
      `session=${sessionId}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    ]);

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: 'Login successful',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}