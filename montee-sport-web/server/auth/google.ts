import 'dotenv/config';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '../../src/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  // Find or create user in your DB
  const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await prisma.user.create({
      data: {
        email,
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        password: '', // Set a default value or generate a random password if needed
        // ...add other fields as needed
      }
    });
  }
  // Always fetch user with role after creation or lookup
  const userWithRole = await prisma.user.findUnique({ where: { email } });
  if (userWithRole) {
    done(null, userWithRole);
  } else {
    done(undefined, undefined);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

// Helper to issue JWT for Google OAuth
export function issueGoogleJwt(user: any) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

export default passport;