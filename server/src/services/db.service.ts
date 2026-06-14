import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Local in-memory DB fallback for demo reliability
const memoryDb = {
  users: new Map<string, any>(),
  logins: [] as any[],
  transactions: [] as any[],
  proposals: new Map<number, any>(),
  nodeConfigs: new Map<string, any>(),
};

// Seed some initial memory data
memoryDb.nodeConfigs.set("ethereum", { network: "ethereum", rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/your-key", provider: "Alchemy", isActive: true });
memoryDb.nodeConfigs.set("sepolia", { network: "sepolia", rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/your-key", provider: "Alchemy", isActive: true });
memoryDb.nodeConfigs.set("polygon", { network: "polygon", rpcUrl: "https://polygon-mainnet.g.alchemy.com/v2/your-key", provider: "Alchemy", isActive: true });

memoryDb.proposals.set(0, { proposalId: 0, title: "Upgrade Staking APY to 15%", description: "Increase the APY rewards from 10% to 15% to attract more liquidity.", votesFor: "12500000000000000000000", votesAgainst: "4200000000000000000000", endTime: new Date(Date.now() + 864000 * 1000), executed: false });
memoryDb.proposals.set(1, { proposalId: 1, title: "Integrate Wormhole Bridge", description: "Deploy core swap routing through Wormhole cross-chain messaging protocol.", votesFor: "870000000000000000000", votesAgainst: "1200000000000000000000", endTime: new Date(Date.now() - 3600 * 1000), executed: false });

export const db = {
  user: {
    findUnique: async (args: { where: { address?: string; id?: string } }) => {
      try {
        return await prisma.user.findUnique(args as any);
      } catch (err) {
        if (args.where.address) {
          return memoryDb.users.get(args.where.address.toLowerCase()) || null;
        }
        if (args.where.id) {
          return Array.from(memoryDb.users.values()).find(u => u.id === args.where.id) || null;
        }
        return null;
      }
    },
    create: async (args: { data: { address: string; name?: string; role?: "USER" | "ADMIN" } }) => {
      try {
        return await prisma.user.create(args);
      } catch (err) {
        const newUser = {
          id: `mem-usr-${Math.random().toString(36).substr(2, 9)}`,
          address: args.data.address.toLowerCase(),
          role: args.data.role || "USER",
          name: args.data.name || null,
          bio: null,
          referralCode: `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          referredBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryDb.users.set(newUser.address, newUser);
        return newUser;
      }
    },
    update: async (args: { where: { address: string }; data: { name?: string; bio?: string } }) => {
      try {
        return await prisma.user.update(args as any);
      } catch (err) {
        const u = memoryDb.users.get(args.where.address.toLowerCase());
        if (u) {
          if (args.data.name !== undefined) u.name = args.data.name;
          if (args.data.bio !== undefined) u.bio = args.data.bio;
          u.updatedAt = new Date();
          memoryDb.users.set(u.address, u);
          return u;
        }
        throw new Error("User not found");
      }
    }
  },
  loginHistory: {
    create: async (args: { data: { userId: string; ip: string; userAgent: string } }) => {
      try {
        return await prisma.loginHistory.create(args);
      } catch (err) {
        const log = {
          id: `mem-log-${Math.random().toString(36).substr(2, 9)}`,
          userId: args.data.userId,
          ip: args.data.ip,
          userAgent: args.data.userAgent,
          timestamp: new Date(),
        };
        memoryDb.logins.push(log);
        return log;
      }
    },
    findMany: async (args: { where: { userId: string }; orderBy?: any; take?: number }) => {
      try {
        return await prisma.loginHistory.findMany(args);
      } catch (err) {
        return memoryDb.logins
          .filter(l => l.userId === args.where.userId)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, args.take || 10);
      }
    }
  },
  transaction: {
    create: async (args: { data: { userId: string; txHash: string; from: string; to: string; amount: string; network: string; status: string; gasUsed?: string } }) => {
      try {
        return await prisma.transaction.create(args);
      } catch (err) {
        const tx = {
          id: `mem-tx-${Math.random().toString(36).substr(2, 9)}`,
          ...args.data,
          createdAt: new Date(),
        };
        memoryDb.transactions.push(tx);
        return tx;
      }
    },
    findMany: async (args: { where: { userId?: string }; orderBy?: any; take?: number }) => {
      try {
        return await prisma.transaction.findMany(args);
      } catch (err) {
        let list = memoryDb.transactions;
        if (args.where?.userId) {
          list = list.filter(t => t.userId === args.where?.userId);
        }
        return list
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, args.take || 10);
      }
    }
  },
  daoProposal: {
    findMany: async (args?: any) => {
      try {
        return await (prisma as any).dAOProposal.findMany(args);
      } catch (err) {
        return Array.from(memoryDb.proposals.values());
      }
    },
    upsert: async (args: { where: { proposalId: number }; update: any; create: any }) => {
      try {
        return await (prisma as any).dAOProposal.upsert(args);
      } catch (err) {
        const id = args.where.proposalId;
        const exists = memoryDb.proposals.has(id);
        const data = exists 
          ? { ...memoryDb.proposals.get(id), ...args.update }
          : { ...args.create, id: `mem-prp-${id}` };
        memoryDb.proposals.set(id, data);
        return data;
      }
    }
  },
  nodeConfig: {
    findMany: async () => {
      try {
        return await prisma.nodeConfig.findMany();
      } catch (err) {
        return Array.from(memoryDb.nodeConfigs.values());
      }
    },
    upsert: async (args: { where: { network: string }; update: any; create: any }) => {
      try {
        return await prisma.nodeConfig.upsert(args);
      } catch (err) {
        const net = args.where.network;
        const exists = memoryDb.nodeConfigs.has(net);
        const data = exists
          ? { ...memoryDb.nodeConfigs.get(net), ...args.update }
          : { ...args.create, id: `mem-node-${net}` };
        memoryDb.nodeConfigs.set(net, data);
        return data;
      }
    }
  }
};
