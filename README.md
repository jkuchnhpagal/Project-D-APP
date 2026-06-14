# Astraea | Futuristic Web3 Decentralized Application (dApp)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jkuchnhpagal/Project-D-APP)

Astraea is a world-class, premium-quality Web3 portal featuring a futuristic 3D animated user interface. Built with modern, enterprise-grade architecture, Astraea incorporates cryptographic signature-based authentication (SIWE), interactive DeFi vaults, DAO voting governance, real-time node monitoring, and seamless local or containerized execution.

---

## 🏗️ Repository Architecture

The project is structured as a monorepo containing three modular sub-sections:

```
d-app/
├── client/                 # Next.js 16 Web Application (TypeScript, Tailwind v4, Three.js, GSAP)
│   ├── src/
│   │   ├── app/            # App Router files (Landing, Layouts, Dashboard tabs)
│   │   ├── components/     # ThreeCanvas 3D components, Navbars
│   │   └── context/        # Web3 Context, Auth Context (SIWE, JWT sessions)
│   ├── Dockerfile          # NextJS production Docker container builder
│   └── fleek.json          # Decentalized IPFS / Fleek build parameters
├── server/                 # Express API Backend (TypeScript, Prisma ORM, Redis)
│   ├── prisma/             # Schema definitions for Users, Logs, and TXs
│   ├── src/
│   │   ├── controllers/    # Cryptographic SIWE verify handlers & Stats loaders
│   │   └── services/       # DB connection (Prisma with Memory Fallback), Cache service
│   └── Dockerfile          # Express production Docker container builder
├── contracts/              # Solidity Smart Contracts (Hardhat config)
│   ├── TokenSwap.sol       # ERC20 Utility Token with mock Staking
│   ├── Web3NFT.sol         # ERC721 collectible with Supply controls
│   ├── DAOAdmin.sol        # Governance voting contract (Upgradeable Proxy ready)
│   └── hardhat.config.ts   # Multi-chain network deployment configurations
├── docker-compose.yml      # Root multi-container orchestration (DB, Cache, API, Client)
└── README.md               # Setup and development instructions
```

---

## ⚡ Key Features

1. **Futuristic 3D Canvas:** Custom WebGL elements rendered via React Three Fiber (R3F) featuring floating 3D crypto cubes, nodes linked by pulsing glowing connector lines, and cursor-reactive starfields.
2. **SIWE Authentication:** Sign-In with Ethereum standard. Decodes cryptography messages on Node.js using Ethers.js and registers sessions via HttpOnly JWT cookies.
3. **Decentralized Fallbacks:** Prisma queries fall back automatically to local RAM storage maps if the PostgreSQL database is offline. Redis cache falls back gracefully to local JS caching.
4. **Token Swap Simulator:** Uniswap-style swapping interface with live price feeds (CoinGecko cached) and transaction signers.
5. **Staking & DAO:** Stake custom ASTRA tokens, earn yield compound indices, draft governance proposals, and vote with signature weight tracking.
6. **AI Advisor:** Integrated chatbot capable of answering questions regarding gas prices, yield staking APYs, SIWE protocols, and cross-chain message routes.
7. **Admin Command Center:** System log stream, CPU/Memory hardware usage indicator, and RPC Node config switcher.

---

## 🛠️ Local Installation & Launch

### Prerequisites
- **Node.js** v18+
- **NPM** or **Yarn**
- **MetaMask** or other Web3 browser wallet extension (Optional: The application automatically triggers an interactive **Demo Mode** if no extension is detected).

### Option A: Run inside Docker Containers (Recommended)
Compile and launch the entire stack (PostgreSQL, Redis, Backend, and Frontend) in one command:
```bash
docker-compose up --build
```
- Web Client: http://localhost:3000
- Backend API: http://localhost:5000

---

### Option B: Local Development Run (Without Docker)

Astraea contains built-in fallbacks that allow running the application locally even if PostgreSQL or Redis are not running.

#### 1. Setup Backend Server
```bash
cd server
npm install
npm run dev
```
The server will boot on `http://localhost:5000`. If it fails to connect to PostgreSQL, it will output a warning and switch to its built-in in-memory mock database automatically.

#### 2. Setup Web Client
In another terminal:
```bash
cd client
npm install
npm run dev
```
The Next.js client will boot on `http://localhost:3000`.

---

## 🌐 Decentralized Hosting & Fleek Deployment

Astraea is fully configured for deployment on decentralized storage networks like IPFS via **Fleek**.

1. Install Fleek CLI:
   ```bash
   npm install -g @fleek/cli
   ```
2. Log in and initialize:
   ```bash
   fleek login
   fleek sites init
   ```
3. Deploy to IPFS:
   ```bash
   fleek sites deploy
   ```
The build configuration in `client/fleek.json` will export NextJS into static files (`out/` directory) and publish them on IPFS.

---

## 🤝 Smart Contract Compilation

Smart contracts are written in Solidity v0.8.20 and configurable in `contracts/hardhat.config.ts`.

To compile the contracts locally:
```bash
cd contracts
npm install
npx hardhat compile
```

To run contract tests or deploy to testnets:
```bash
npx hardhat test
npx hardhat run scripts/deploy.ts --network sepolia
```
