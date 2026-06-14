import { Request, Response } from "express";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import { db } from "../services/db.service";
import cache from "../services/redis.service";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-astraea-dapp";

// Helper to generate a SIWE nonce
export const getNonce = async (req: Request, res: Response) => {
  const nonce = Math.random().toString(36).substring(2, 15);
  // Store in cache for 5 minutes with a unique ID
  const tempId = Math.random().toString(36).substring(2, 15);
  await cache.set(`nonce:${tempId}`, nonce, 300);

  // Send nonce and a temporary identifier to the client
  res.cookie("nonce_id", tempId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300000,
  });

  return res.json({ nonce });
};

// Verify the SIWE signature
export const verifySignature = async (req: Request, res: Response) => {
  try {
    const { message, signature, address } = req.body;
    const tempId = req.cookies.nonce_id;

    if (!message || !signature || !address) {
      return res.status(400).json({ error: "Missing required auth fields" });
    }

    if (!tempId) {
      return res.status(400).json({ error: "Session expired or missing nonce ID" });
    }

    // Retrieve active nonce from cache
    const activeNonce = await cache.get(`nonce:${tempId}`);
    if (!activeNonce) {
      return res.status(400).json({ error: "Invalid or expired nonce" });
    }

    // Standard SIWE message checks
    if (!message.includes(activeNonce)) {
      return res.status(400).json({ error: "Nonce mismatch" });
    }
    if (!message.toLowerCase().includes(address.toLowerCase())) {
      return res.status(400).json({ error: "Address mismatch" });
    }

    // Verify cryptographic signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: "Cryptographic signature validation failed" });
    }

    // Nonce consumed, delete it from cache
    await cache.del(`nonce:${tempId}`);

    // Create or retrieve user from database
    let user = await db.user.findUnique({ where: { address: address.toLowerCase() } });
    if (!user) {
      // Create user. Grant first address standard or admin role
      const isFirstUser = (await db.user.findUnique({ where: { address: address.toLowerCase() } })) === null;
      user = await db.user.create({
        data: {
          address: address.toLowerCase(),
          name: `Astraea Pioneer`,
          role: address.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" ? "ADMIN" : "USER" // Default Hardhat account 0 is admin
        }
      });
    }

    // Record login audit log
    await db.loginHistory.create({
      data: {
        userId: user.id,
        ip: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "unknown",
      }
    });

    // Sign JWT token
    const token = jwt.sign(
      { id: user.id, address: user.address, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set JWT in secure HttpOnly cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400000, // 24 hours
    });

    return res.json({
      success: true,
      user: {
        address: user.address,
        role: user.role,
        name: user.name,
        referralCode: user.referralCode,
      }
    });
  } catch (error: any) {
    console.error("Signature verification error:", error);
    return res.status(500).json({ error: "Internal server error during validation" });
  }
};

// Check profile / status using cookie
export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await db.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const loginLogs = await db.loginHistory.findMany({
      where: { userId: user.id },
      take: 5,
    });

    return res.json({
      authenticated: true,
      user: {
        address: user.address,
        role: user.role,
        name: user.name,
        bio: user.bio,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
      },
      logins: loginLogs,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load profile" });
  }
};

// Update profile details
export const updateProfile = async (req: any, res: Response) => {
  try {
    const { name, bio } = req.body;
    const updated = await db.user.update({
      where: { address: req.user.address },
      data: { name, bio },
    });
    return res.json({ success: true, user: updated });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update profile" });
  }
};

// Log out user
export const logout = (req: Request, res: Response) => {
  res.clearCookie("auth_token");
  res.clearCookie("nonce_id");
  return res.json({ success: true });
};
