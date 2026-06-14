import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { getNonce, verifySignature, getProfile, updateProfile, logout } from "./controllers/auth.controller";
import { getDashboardStats, getTransactions, createTransaction, getNodes, updateNodeConfig, getProposals, createProposal, getSystemLogs } from "./controllers/dashboard.controller";

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-astraea-dapp";

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS policy
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Parsing middlewares
app.use(express.json({ limit: "10kb" })); // Prevent large payload attacks
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: "Too many requests from this IP. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Authentication Middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    address: string;
    role: "USER" | "ADMIN";
  };
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = (req as any).cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ error: "Access denied. Connect wallet to sign in." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie("auth_token");
    return res.status(403).json({ error: "Invalid or expired session. Please sign in again." });
  }
};

// --- ROUTES ---

// Root API Status Endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    message: "Astraea Enterprise Web3 API Core Service is online and operational.",
    version: "1.0.0",
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  });
});

// Public Auth API
app.get("/api/auth/nonce", getNonce);
app.post("/api/auth/verify", verifySignature);
app.post("/api/auth/logout", logout);

// Protected Auth API
app.get("/api/auth/profile", authenticateToken, getProfile);
app.put("/api/auth/profile", authenticateToken, updateProfile);

// Protected Dashboard API
app.get("/api/dashboard/stats", authenticateToken, getDashboardStats);
app.get("/api/dashboard/transactions", authenticateToken, getTransactions);
app.post("/api/dashboard/transactions", authenticateToken, createTransaction);
app.get("/api/dashboard/nodes", authenticateToken, getNodes);
app.get("/api/dashboard/proposals", authenticateToken, getProposals);

// Protected Admin API
app.post("/api/admin/nodes", authenticateToken, updateNodeConfig);
app.post("/api/admin/proposals", authenticateToken, createProposal);
app.get("/api/admin/logs", authenticateToken, getSystemLogs);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Astraea Backend running on http://localhost:${PORT}`);
});
