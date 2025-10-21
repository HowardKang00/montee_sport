import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { PrismaClient } from "../src/generated/prisma";
import orderRoutes from "./routes/orderStatus";
import checkoutRoutes from "./routes/checkout";
import webhookRoutes from "./routes/webhook";
import userRoutes from "./routes/users";
import session from 'express-session';
import passport from './auth/google'; // path to your passport config
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the server's .env file
dotenv.config({ path: resolve(__dirname, '.env') });

// Initialize Express app and Prisma client
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/order-status", orderRoutes);
app.use("/api/cart", checkoutRoutes);
app.use("/api/xendit", webhookRoutes);
app.use(session({ secret: 'your-session-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Start Google OAuth
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Issue JWT and redirect or respond with token
    const user = req.user as any;
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    // Option 1: Redirect to frontend with token in query
    res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
    // Option 2: Send token as JSON
    // res.json({ token });
  }
);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(4000, () => console.log("Server running on http://localhost:4000"));
