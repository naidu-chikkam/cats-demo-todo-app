import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/db';
import { users, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    return null;
  }
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  await db.insert(sessions).values({
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt,
  });
  
  return sessionId;
}

export async function getSessionUser(sessionId: string) {
  try {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: {
        user: true,
      },
    });
    
    if (!session || session.expires_at < new Date()) {
      return null;
    }
    
    return session.user;
  } catch {
    return null;
  }
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}