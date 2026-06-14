import { Request, Response } from "express";
import { db } from "../services/db.service";
import cache from "../services/redis.service";

// Get dashboard main metrics & rates
export const getDashboardStats = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // Fetch user-specific tx counts
    const txs = await db.transaction.findMany({ where: { userId }, take: 10 });
    
    // Fetch live market data (cached or simulated)
    const marketPrices = await getLiveMarketData();

    // Node statuses
    const nodes = await db.nodeConfig.findMany();

    // Staking summaries (mocked or aggregated from db if tracked)
    const stakingStats = {
      totalStaked: "4,250.85 ASTRA",
      totalRewardsClaimed: "145.20 ASTRA",
      stakingApy: "10.0%",
    };

    return res.json({
      transactions: txs,
      nodes,
      market: marketPrices,
      staking: stakingStats,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to gather dashboard stats: " + err.message });
  }
};

// Fetch transaction history
export const getTransactions = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "ADMIN";
    
    const query: any = { take: 50 };
    if (!isAdmin) {
      query.where = { userId };
    }
    const transactions = await db.transaction.findMany(query);

    return res.json({ transactions });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load transactions" });
  }
};

// Create a transaction record
export const createTransaction = async (req: any, res: Response) => {
  try {
    const { txHash, from, to, amount, network, status, gasUsed } = req.body;
    
    if (!txHash || !from || !to || !amount || !network || !status) {
      return res.status(400).json({ error: "Missing required transaction fields" });
    }

    const tx = await db.transaction.create({
      data: {
        userId: req.user.id,
        txHash,
        from,
        to,
        amount,
        network,
        status,
        gasUsed: gasUsed || null,
      },
    });

    return res.json({ success: true, transaction: tx });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save transaction record" });
  }
};

// Get active blockchain nodes (RPCs)
export const getNodes = async (req: Request, res: Response) => {
  try {
    const nodes = await db.nodeConfig.findMany();
    return res.json({ nodes });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load RPC configurations" });
  }
};

// Admin: Upsert Node Configuration
export const updateNodeConfig = async (req: any, res: Response) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const { network, rpcUrl, provider, isActive } = req.body;
    if (!network || !rpcUrl || !provider) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const config = await db.nodeConfig.upsert({
      where: { network },
      update: { rpcUrl, provider, isActive: isActive ?? true },
      create: { network, rpcUrl, provider, isActive: isActive ?? true },
    });

    return res.json({ success: true, node: config });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update node configuration" });
  }
};

// Get DAO Proposals
export const getProposals = async (req: Request, res: Response) => {
  try {
    const proposals = await db.daoProposal.findMany();
    return res.json({ proposals });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load DAO proposals" });
  }
};

// Admin: Add or Sync DAO Proposal
export const createProposal = async (req: any, res: Response) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const { proposalId, title, description, endTime, votesFor, votesAgainst } = req.body;

    const proposal = await db.daoProposal.upsert({
      where: { proposalId },
      update: { votesFor: votesFor || "0", votesAgainst: votesAgainst || "0" },
      create: {
        proposalId,
        title,
        description,
        endTime: new Date(endTime),
        votesFor: votesFor || "0",
        votesAgainst: votesAgainst || "0",
      },
    });

    return res.json({ success: true, proposal });
  } catch (err) {
    return res.status(500).json({ error: "Failed to sync DAO proposal" });
  }
};

// Admin: System Logs & Node Stats (Simulated dynamic logs for dashboard UI)
export const getSystemLogs = async (req: any, res: Response) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    const logs = [
      { timestamp: new Date(Date.now() - 5000), service: "RPC-POLYGON", level: "INFO", message: "Block 58129031 synced successfully. Gas: 45.2 Gwei." },
      { timestamp: new Date(Date.now() - 30000), service: "REDIS-CACHE", level: "INFO", message: "CoinGecko ticker cache refreshed." },
      { timestamp: new Date(Date.now() - 120000), service: "AUTH", level: "INFO", message: `SIWE Signature login for admin ${req.user.address}` },
      { timestamp: new Date(Date.now() - 300000), service: "RPC-ETHEREUM", level: "WARNING", message: "RPC endpoint Alchemy Sepolia latency exceeded 450ms. Rerouting traffic." },
      { timestamp: new Date(Date.now() - 600000), service: "DB-POSTGRES", level: "INFO", message: "Vacuum process completed on Transaction table." }
    ];

    const sysMetrics = {
      cpuUsage: "12%",
      memoryUsage: "48%",
      redisConnected: true,
      rpcHealthy: true,
    };

    return res.json({ logs, metrics: sysMetrics });
  } catch (err) {
    return res.status(500).json({ error: "Failed to get logs" });
  }
};

// Internal utility to aggregate and cache market feeds
async function getLiveMarketData() {
  const cacheKey = "market:prices";
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }

  // Fallback / simulated values matching standard cryptocurrency rates
  const market = [
    { id: "ethereum", symbol: "ETH", name: "Ethereum", price: 3421.50, change24h: 2.45 },
    { id: "polygon", symbol: "POL", name: "Polygon", price: 0.582, change24h: -1.2 },
    { id: "binancecoin", symbol: "BNB", name: "BNB Chain", price: 585.30, change24h: 0.15 },
    { id: "arbitrum", symbol: "ARB", name: "Arbitrum", price: 0.985, change24h: 4.8 },
    { id: "astraea", symbol: "ASTRA", name: "Astraea Token", price: 1.25, change24h: 12.5 },
  ];

  await cache.set(cacheKey, JSON.stringify(market), 60); // Cache for 1 minute
  return market;
}
