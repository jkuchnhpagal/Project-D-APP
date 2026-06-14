"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowRight, Cpu, Shield, Layers, Wallet, Globe2, BarChart3, 
  Terminal, Sparkles, RefreshCw, Send, PlusCircle, CheckCircle2,
  TrendingUp, HelpCircle, ChevronDown, Award, Activity, Vote,
  MapPin, TrendingDown, Coins, Lock, Server, Clock, ChevronRight
} from "lucide-react";
import confetti from "canvas-confetti";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Dynamically import ThreeCanvas to bypass SSR errors
const ThreeCanvas = dynamic(() => import("../components/ThreeCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-0 h-full w-full bg-[#030303] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-brand-purple/10 border-t-brand-purple animate-spin" />
    </div>
  ),
});

export default function Home() {
  const { isConnected, address, balance, connectWallet, signMessage } = useWeb3();
  const { authenticated } = useAuth();

  // --- Interactive CLI State ---
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: "in" | "out"; text: string }>>([
    { type: "out", text: "Astraea Core Protocol OS v1.0.0 booting..." },
    { type: "out", text: "Connection: secure cryptographic sockets established." },
    { type: "out", text: "Node telemetry: Alchemy Sepolia [Online - 38ms latency]" },
    { type: "out", text: "Static edge cache: Redis node active." },
    { type: "out", text: "Type 'help' to review available command vectors." },
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  const executeCliCommand = async (cmdText: string) => {
    const raw = cmdText.trim();
    if (!raw) return;

    const historyCopy = [...terminalHistory, { type: "in" as const, text: raw }];
    setTerminalHistory(historyCopy);
    setTerminalInput("");

    const tokens = raw.toLowerCase().split(/\s+/);
    const primary = tokens[0];

    const out = (text: string) => {
      setTerminalHistory(prev => [...prev, { type: "out", text }]);
    };

    switch (primary) {
      case "help":
        out("Available commands:");
        out("  status      - Check core protocol running status & health metrics.");
        out("  nodes       - Output detailed RPC Node gateway latency tests.");
        out("  stats       - Display ASTRA tokenomics metrics (TVL, supply, APY).");
        out("  bridge      - Simulate a cross-chain transmission contract.");
        out("  clear       - Wipe the CLI console log buffer.");
        out("  theme       - Print design token status.");
        break;
      case "status":
        out("SYS_STATUS: HEALTHY");
        out(`  Block Sync: 18,941,209 [Target: Sepolia]`);
        out("  Database: PostgreSQL (Neon Serverless Pool) - Operational");
        out("  Cache Node: Redis (Upstash Distributed Store) - Active");
        out("  Memory footprint: 48.2 MB heap allocation");
        break;
      case "nodes":
        out("Testing endpoint gateways...");
        out("  Alchemy Ethereum Sepolia: 32ms | status: ACTIVE");
        out("  Infura Mainnet Gateway:   45ms | status: ACTIVE");
        out("  QuickNode Polygon Relayer: 24ms | status: ACTIVE");
        out("  Astraea Global Edge Node:  12ms | status: OPTIMAL");
        break;
      case "stats":
        out("ASTRA Protocol Tickers:");
        out("  Circulating Supply: 42,500,000 ASTRA");
        out("  Total Locked Value (TVL): $53,125,000 USD");
        out("  Vault Compound Yield (APY): 10.0% standard, up to 35.0% boosted");
        out("  Active Decentralized Validators: 128 nodes");
        break;
      case "bridge":
        out("Starting cross-chain router simulator... Please trigger the bridge from the widget below.");
        break;
      case "clear":
        setTerminalHistory([]);
        break;
      case "theme":
        out("Active theme configuration: obsidian-dark.");
        out("Design system: Vercel-like border-grid grids, 1px lines.");
        break;
      default:
        out(`CLI Error: Command '${primary}' not found. Type 'help' for support.`);
    }
  };

  // --- Cross-Chain Bridge Calculator State ---
  const [bridgeFrom, setBridgeFrom] = useState("ethereum");
  const [bridgeTo, setBridgeTo] = useState("polygon");
  const [bridgeAmount, setBridgeAmount] = useState("1.0");
  const [bridgeStatus, setBridgeStatus] = useState("");
  const [bridgeTxHash, setBridgeTxHash] = useState("");
  const [bridgeProgress, setBridgeProgress] = useState(0);
  const [isBridging, setIsBridging] = useState(false);

  const triggerCelebration = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  // Run simulated Bridge Router with DB synchronization
  const handleBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(bridgeAmount) <= 0 || isBridging) return;

    setIsBridging(true);
    setBridgeTxHash("");
    setBridgeProgress(5);

    // 1. Check wallet connection
    if (!isConnected) {
      setBridgeStatus("Wallet connection required. Launching modal...");
      const connected = await connectWallet();
      if (!connected) {
        setBridgeStatus("Bridge aborted: Wallet disconnected.");
        setIsBridging(false);
        return;
      }
    }

    // 2. Validate balance
    if (balance && parseFloat(bridgeAmount) > parseFloat(balance)) {
      setBridgeStatus(`Insufficient funds. You have ${balance} ETH.`);
      setIsBridging(false);
      return;
    }

    setBridgeStatus("Signing cross-chain message envelope...");
    setBridgeProgress(15);

    // 3. Request cryptographic signature
    const message = `Authorize bridging of ${bridgeAmount} tokens from ${bridgeFrom} to ${bridgeTo}`;
    const sig = await signMessage(message);
    if (!sig) {
      setBridgeStatus("Signature denied by user.");
      setIsBridging(false);
      return;
    }

    setBridgeStatus("Locking assets on source vault contract...");
    setBridgeProgress(40);

    setTimeout(() => {
      setBridgeStatus("Wormhole relayer verifying signature package...");
      setBridgeProgress(70);

      setTimeout(() => {
        setBridgeStatus("Minting synthetic assets on destination network...");
        setBridgeProgress(90);

        setTimeout(async () => {
          const hash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
          setBridgeTxHash(hash);
          setBridgeProgress(100);
          setBridgeStatus("Bridge operation fully confirmed!");
          triggerCelebration();

          // Write transaction to the backend database if signed in
          if (authenticated && address) {
            try {
              const res = await fetch(`${API_BASE_URL}/dashboard/transactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  txHash: hash,
                  from: address,
                  to: `synthetics-${bridgeTo}`,
                  amount: bridgeAmount,
                  network: bridgeFrom,
                  status: "SUCCESS",
                  gasUsed: "48290",
                }),
                credentials: "include",
              });
              if (res.ok) {
                setBridgeStatus("Bridge operation completed & synced to database!");
              } else {
                setBridgeStatus("Bridge completed. Sync failed (unauthorized).");
              }
            } catch (err) {
              setBridgeStatus("Bridge completed. Confirmed locally (database offline).");
            }
          } else {
            setBridgeStatus("Bridge completed. Connect & Sign in to sync with history!");
          }

          setIsBridging(false);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  // --- Live Token Prices & Gas Estimator ---
  const [tokenPrices, setTokenPrices] = useState({
    ASTRA: { price: 1.25, change: 12.5, sparkline: [1.10, 1.12, 1.15, 1.22, 1.20, 1.24, 1.25] },
    ETH: { price: 3421.50, change: 2.45, sparkline: [3320, 3350, 3400, 3390, 3410, 3415, 3421.5] },
    POL: { price: 0.582, change: -1.2, sparkline: [0.60, 0.595, 0.59, 0.585, 0.587, 0.58, 0.582] },
  });

  const [gasFees, setGasFees] = useState({ slow: 12, standard: 24, fast: 42 });

  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuating rates slightly
      setTokenPrices(prev => ({
        ASTRA: {
          ...prev.ASTRA,
          price: parseFloat((prev.ASTRA.price + (Math.random() * 0.04 - 0.02)).toFixed(4)),
        },
        ETH: {
          ...prev.ETH,
          price: parseFloat((prev.ETH.price + (Math.random() * 10 - 5)).toFixed(2)),
        },
        POL: {
          ...prev.POL,
          price: parseFloat((prev.POL.price + (Math.random() * 0.01 - 0.005)).toFixed(4)),
        },
      }));

      setGasFees(prev => ({
        slow: Math.max(5, prev.slow + Math.floor(Math.random() * 5) - 2),
        standard: Math.max(10, prev.standard + Math.floor(Math.random() * 7) - 3),
        fast: Math.max(20, prev.fast + Math.floor(Math.random() * 11) - 5),
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // --- Yield Calculator State ---
  const [calcAsset, setCalcAsset] = useState("ASTRA");
  const [calcAmount, setCalcAmount] = useState(1000);
  const [calcDuration, setCalcDuration] = useState(12); // in months

  const getApy = () => {
    let base = 10;
    if (calcAsset === "ETH") base = 4.2;
    if (calcAsset === "USDC") base = 6.5;

    // APY boost based on lock duration
    let multiplier = 1;
    if (calcDuration === 3) multiplier = 1.3;
    if (calcDuration === 12) multiplier = 2.0;
    if (calcDuration === 48) multiplier = 3.5;

    return parseFloat((base * multiplier).toFixed(1));
  };

  const calculateReturn = () => {
    const apy = getApy() / 100;
    const years = calcDuration / 12;
    // Compounding monthly formula
    const finalTokens = calcAmount * Math.pow(1 + apy / 12, 12 * years);
    const profit = finalTokens - calcAmount;
    return {
      total: finalTokens.toFixed(2),
      earned: profit.toFixed(2),
    };
  };

  // --- Interactive Validator Nodes & Map ---
  const [selectedValidator, setSelectedValidator] = useState("Frankfurt");
  const [validatorNodes, setValidatorNodes] = useState<{ [key: string]: { ip: string; uptime: string; load: string; ping: number | string; height: number; state: "idle" | "pinging" } }>({
    "New York": { ip: "148.24.119.80", uptime: "99.98%", load: "32%", ping: 48, height: 18941209, state: "idle" },
    Frankfurt: { ip: "192.168.10.42", uptime: "99.99%", load: "18%", ping: 12, height: 18941212, state: "idle" },
    Tokyo: { ip: "210.85.34.195", uptime: "99.95%", load: "45%", ping: 95, height: 18941207, state: "idle" },
    Singapore: { ip: "118.201.5.8", uptime: "99.97%", load: "28%", ping: 72, height: 18941208, state: "idle" },
  });

  const triggerValidatorPing = (city: string) => {
    setValidatorNodes(prev => ({
      ...prev,
      [city]: { ...prev[city], state: "pinging" as const, ping: "..." },
    }));

    setTimeout(() => {
      setValidatorNodes(prev => {
        const basePing = city === "Frankfurt" ? 12 : city === "New York" ? 48 : city === "Singapore" ? 72 : 95;
        const randomFluct = Math.floor(Math.random() * 9) - 4;
        return {
          ...prev,
          [city]: {
            ...prev[city],
            state: "idle" as const,
            ping: Math.max(5, basePing + randomFluct),
            height: prev[city].height + Math.floor(Math.random() * 2),
          },
        };
      });
    }, 1200);
  };

  // --- Tokenomics Donut Chart State ---
  const [hoveredTokenomics, setHoveredTokenomics] = useState<number | null>(null);
  const tokenomicsData = [
    { title: "Staking Rewards", percentage: 35, color: "#9b66ff", description: "Incentive pools compounding yields to node operators.", vesting: "4-year linear release" },
    { title: "Ecosystem Fund", percentage: 25, color: "#06b6d4", description: "Developer grants, integrations, and protocol growth projects.", vesting: "3-year vesting, 6-month cliff" },
    { title: "DAO Treasury", percentage: 15, color: "#3b82f6", description: "Reserve governance pool controlled by smart contract polls.", vesting: "Fully locked, proposal access only" },
    { title: "Core Team", percentage: 15, color: "#4f46e5", description: "Founding engineers, security advisors, and cryptographers.", vesting: "4-year vesting, 1-year cliff" },
    { title: "Public Launch Pool", percentage: 10, color: "#ec4899", description: "Liquidity bootstrapping on decentralized swap platforms.", vesting: "100% unlocked at genesis" },
  ];

  // Helper variables for responsive SVG donut paths
  const currentTokenomics = hoveredTokenomics !== null ? tokenomicsData[hoveredTokenomics] : null;

  // --- FAQ Accordion State ---
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // --- Email Whitelist State ---
  const [email, setEmail] = useState("");
  const [whitelistStatus, setWhitelistStatus] = useState("");

  const handleWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setWhitelistStatus("Please provide a valid email address.");
      return;
    }
    setWhitelistStatus("Cryptographic key registration in progress...");
    setTimeout(() => {
      setWhitelistStatus("Key successfully added to Astraea Early Access!");
      setEmail("");
      triggerCelebration();
    }, 1200);
  };

  // --- Quick DAO votes state ---
  const [daoProposals, setDaoProposals] = useState([
    { id: 0, title: "Upgrade Staking APY to 15%", votes: 12540 },
    { id: 1, title: "Integrate Wormhole Bridge Relay", votes: 8741 }
  ]);

  const handleQuickVote = (id: number) => {
    setDaoProposals(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, votes: p.votes + 1 };
      }
      return p;
    }));
    triggerCelebration();
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-center grid-lines">
      {/* Interactive 3D WebGL Canvas */}
      <ThreeCanvas />

      {/* Spotlights */}
      <div className="spotlight top-10 left-10" />
      <div className="spotlight bottom-10 right-10" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16 flex flex-col items-center text-center justify-center flex-grow">
        <div className="max-w-5xl flex flex-col items-center mb-16">
          {/* Badge */}
          <div className="bento-card px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-brand-purple flex items-center gap-2 mb-6">
            <Sparkles size={12} className="text-brand-purple animate-pulse" />
            <span>ENTERPRISE WEB3 PLATFORM</span>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl tracking-tighter leading-none mb-6 text-gradient">
            Powering High Fidelity <br />
            <span className="accent-gradient">Decentralized Finance</span>
          </h1>

          {/* Subheading */}
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed font-sans">
            Astraea coordinates hardware validator RPC nodes, cross-chain messaging relays, staking vaults, and signature auth under a single premium dashboard workspace.
          </p>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 bg-white text-black font-display font-semibold rounded-xl text-xs tracking-wider cursor-pointer flex items-center gap-1.5 transition-all hover:bg-neutral-200 active:scale-95 shadow-lg shadow-white/5"
            >
              Launch Dashboard
              <ArrowRight size={14} />
            </Link>

            {!isConnected && (
              <button
                onClick={() => connectWallet()}
                className="bento-card px-6 py-3.5 text-white font-display font-semibold rounded-xl text-xs tracking-wider cursor-pointer"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Bento Grid: Terminal, Bridge, Prices, Yield, Map, Tokenomics */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 text-left mb-24">
          
          {/* Bento Block 1: CLI Console (Interactive) */}
          <div className="lg:col-span-2 bento-card p-6 rounded-2xl flex flex-col justify-between bg-[#050507]/90 min-h-[300px]">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <Terminal size={14} className="text-brand-purple" />
                    <span className="font-semibold text-gray-400">Interactive Astraea CLI</span>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
                </div>
                
                {/* Scrollable Command History */}
                <div className="max-h-[160px] overflow-y-auto mb-4 scrollbar-thin flex flex-col gap-2 font-mono text-[11px] text-gray-400">
                  {terminalHistory.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-brand-purple select-none font-bold">
                        {log.type === "in" ? "$" : ">"}
                      </span>
                      <span className={log.type === "in" ? "text-white font-medium" : "text-gray-400"}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </div>

              {/* Command Input Form */}
              <div>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    executeCliCommand(terminalInput);
                  }}
                  className="flex items-center border border-white/5 bg-[#030303]/60 rounded-xl px-3 py-2"
                >
                  <span className="text-brand-purple font-mono text-xs select-none font-bold mr-2">$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Type 'help' and press Enter..."
                    className="flex-grow bg-transparent text-white text-xs outline-none border-none font-mono"
                  />
                  <button type="submit" className="text-gray-500 hover:text-white transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </form>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {["help", "status", "nodes", "stats", "clear"].map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => executeCliCommand(cmd)}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[9px] text-gray-500 hover:text-brand-purple hover:border-brand-purple/20 transition-all cursor-pointer"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bento Block 2: Live Token prices & Gas estimator */}
          <div className="bento-card p-6 rounded-2xl flex flex-col justify-between bg-[#050507]/90">
            <div>
              <h3 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2">
                <BarChart3 size={14} className="text-brand-green" />
                Network Markets & Fees
              </h3>

              {/* Market Rates list */}
              <div className="flex flex-col gap-3 mb-6">
                {Object.entries(tokenPrices).map(([symbol, detail]) => (
                  <div key={symbol} className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-white/5 flex items-center justify-center font-mono text-[10px] font-bold text-gray-400">
                        {symbol.slice(0, 1)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">{symbol}</span>
                        <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${detail.change >= 0 ? "text-brand-green" : "text-red-400"}`}>
                          {detail.change >= 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                          {detail.change >= 0 ? "+" : ""}{detail.change}%
                        </span>
                      </div>
                    </div>

                    {/* Sparkline visualization */}
                    <div className="w-14 h-6">
                      <svg viewBox="0 0 100 30" className="w-full h-full">
                        <defs>
                          <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={detail.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity="0.2"/>
                            <stop offset="100%" stopColor={detail.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path
                          d={`M 0 30 ${detail.sparkline.map((v, i) => `L ${(i / 6) * 100} ${30 - ((v - Math.min(...detail.sparkline)) / (Math.max(...detail.sparkline) - Math.min(...detail.sparkline))) * 25}`).join(" ")} L 100 30 Z`}
                          fill={`url(#grad-${symbol})`}
                        />
                        {/* Line */}
                        <path
                          d={detail.sparkline.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / 6) * 100} ${30 - ((v - Math.min(...detail.sparkline)) / (Math.max(...detail.sparkline) - Math.min(...detail.sparkline))) * 25}`).join(" ")}
                          fill="none"
                          stroke={detail.change >= 0 ? "#10b981" : "#ef4444"}
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>

                    {/* Price */}
                    <span className="font-mono text-xs text-white">${detail.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>

              {/* Gas Fee Rates */}
              <div className="border-t border-white/5 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Gas Rates</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bento-card p-2 rounded-xl bg-white/5 border-white/5">
                    <span className="text-[9px] text-gray-500 uppercase block font-mono">Slow</span>
                    <span className="text-xs font-semibold text-white">{gasFees.slow} Gwei</span>
                  </div>
                  <div className="bento-card p-2 rounded-xl bg-white/5 border-white/5">
                    <span className="text-[9px] text-gray-500 uppercase block font-mono">Standard</span>
                    <span className="text-xs font-semibold text-brand-purple">{gasFees.standard} Gwei</span>
                  </div>
                  <div className="bento-card p-2 rounded-xl bg-white/5 border-white/5">
                    <span className="text-[9px] text-gray-500 uppercase block font-mono">Fast</span>
                    <span className="text-xs font-semibold text-white">{gasFees.fast} Gwei</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-gray-500 font-mono mt-4 uppercase">Data updates automatically</span>
          </div>

          {/* Bento Block 3: Cross-Chain Bridge Router (Upgraded) */}
          <div className="lg:col-span-2 bento-card p-6 rounded-2xl bg-[#050507]/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Layers size={14} className="text-brand-blue" />
                  Cross-Chain Bridge Router
                </h3>
                <span className="text-[10px] text-brand-blue font-mono font-semibold uppercase">SECURE PROTOCOL</span>
              </div>
              
              <form onSubmit={handleBridge} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-gray-500 uppercase font-mono">From Chain</span>
                  <select 
                    value={bridgeFrom}
                    onChange={(e) => {
                      setBridgeFrom(e.target.value);
                      setBridgeTo(e.target.value === "ethereum" ? "polygon" : "ethereum");
                    }}
                    className="w-full px-3 py-2 rounded-xl bento-card border-white/5 text-xs text-white outline-none bg-[#030303]"
                  >
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                    <option value="arbitrum">Arbitrum</option>
                    <option value="base">Base</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-gray-500 uppercase font-mono">To Chain</span>
                  <select 
                    value={bridgeTo}
                    onChange={(e) => setBridgeTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bento-card border-white/5 text-xs text-white outline-none bg-[#030303]"
                  >
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                    <option value="arbitrum">Arbitrum</option>
                    <option value="base">Base</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-gray-500 uppercase font-mono">Token Amount</span>
                  <input
                    type="number"
                    value={bridgeAmount}
                    onChange={(e) => setBridgeAmount(e.target.value)}
                    step="0.1"
                    className="w-full px-3 py-2 rounded-xl bento-card border-white/5 text-xs text-white outline-none font-mono bg-[#030303]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isBridging}
                  className="w-full py-2 bg-white text-black font-display font-semibold rounded-xl text-xs tracking-wider cursor-pointer hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-40"
                >
                  {isBridging ? "Locking..." : "Transmit Bridge"}
                </button>
              </form>

              {/* Bridge Progress Indicator */}
              {bridgeProgress > 0 && (
                <div className="mt-6 flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span className="text-brand-cyan">{bridgeStatus}</span>
                    <span>{bridgeProgress}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-blue transition-all duration-300"
                      style={{ width: `${bridgeProgress}%` }}
                    />
                  </div>
                  {bridgeTxHash && (
                    <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono mt-1.5">
                      <span className="truncate max-w-[80%]">TX Hash: {bridgeTxHash}</span>
                      <a
                        href={`https://etherscan.io/tx/${bridgeTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-purple hover:underline"
                      >
                        Verify Etherscan
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            {isConnected && balance && (
              <div className="flex gap-4 mt-6 text-[10px] text-gray-500 font-mono">
                <span>Wallet Balance: {balance} ETH</span>
                <span>Active Relayers: 18 / 18</span>
              </div>
            )}
          </div>

          {/* Bento Block 4: Yield Optimizer Simulator (Interactive) */}
          <div className="bento-card p-6 rounded-2xl bg-[#050507]/90 flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2">
                <Coins size={14} className="text-brand-purple" />
                Yield Vault Simulator
              </h3>

              {/* Selector */}
              <div className="flex gap-2 mb-4">
                {["ASTRA", "ETH", "USDC"].map((token) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => setCalcAsset(token)}
                    className={`flex-grow py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                      calcAsset === token 
                        ? "bg-brand-purple/10 border-brand-purple/30 text-white" 
                        : "bg-white/5 border-white/5 text-gray-400"
                    }`}
                  >
                    {token}
                  </button>
                ))}
              </div>

              {/* Amount and slider */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-gray-500 uppercase font-mono">Amount to Lock</span>
                  <input
                    type="number"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bento-card border-white/5 text-xs text-white outline-none font-mono bg-[#030303]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-gray-500 uppercase font-mono flex justify-between">
                    <span>Lock Duration</span>
                    <span className="text-brand-purple">{calcDuration} Months</span>
                  </span>
                  <div className="flex gap-2">
                    {[1, 3, 12, 48].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCalcDuration(m)}
                        className={`flex-grow py-1 text-[10px] font-bold rounded-lg transition-all ${
                          calcDuration === m 
                            ? "bg-brand-purple text-white" 
                            : "bg-white/5 text-gray-400"
                        }`}
                      >
                        {m === 1 ? "1M" : m === 3 ? "3M" : m === 12 ? "1Y" : "4Y"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* APY Output */}
              <div className="bento-card p-3 rounded-xl bg-white/5 border-white/5 flex items-center justify-between text-xs mb-4">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase font-mono">Yield Return</span>
                  <span className="font-semibold text-white">{getApy()}% APY</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-gray-500 uppercase font-mono">Total at Lockup</span>
                  <span className="font-mono text-brand-cyan">+{calculateReturn().earned} {calcAsset}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
              <span className="flex items-center gap-1">
                <Lock size={10} className="text-brand-purple" />
                Matures to: {calculateReturn().total}
              </span>
              <span>10.0% standard yield</span>
            </div>
          </div>

          {/* Bento Block 5: Interactive Global Node Map */}
          <div className="lg:col-span-2 bento-card p-6 rounded-2xl bg-[#050507]/90 flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Server size={14} className="text-brand-cyan" />
                  Validator Nodes Telemetry
                </h3>
                <span className="text-[10px] text-brand-cyan font-mono font-semibold uppercase">Global Net</span>
              </div>

              {/* Cities Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {Object.entries(validatorNodes).map(([city, data]) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedValidator(city)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-[85px] ${
                      selectedValidator === city 
                        ? "bg-brand-cyan/5 border-brand-cyan/20 text-white" 
                        : "bg-white/5 border-white/5 text-gray-400"
                    }`}
                  >
                    <span className="text-xs font-semibold flex items-center gap-1.5 text-white">
                      <MapPin size={10} className={selectedValidator === city ? "text-brand-cyan" : "text-gray-500"} />
                      {city}
                    </span>
                    <span className="font-mono text-[10px] text-brand-cyan">
                      {data.state === "pinging" ? "pinging..." : `${data.ping} ms`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Node Details */}
              <div className="bento-card p-4 rounded-xl bg-white/5 border-white/5 text-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase font-mono block mb-0.5">IP Address</span>
                  <span className="font-mono text-white text-xs">{validatorNodes[selectedValidator].ip}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 uppercase font-mono block mb-0.5">System Sync Status</span>
                  <span className="font-mono text-white text-xs flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
                    Block #{validatorNodes[selectedValidator].height}
                  </span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] text-gray-500 uppercase font-mono block mb-0.5">Uptime / Load</span>
                    <span className="text-gray-300 font-mono text-[11px]">{validatorNodes[selectedValidator].uptime} | {validatorNodes[selectedValidator].load}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerValidatorPing(selectedValidator)}
                    disabled={validatorNodes[selectedValidator].state === "pinging"}
                    className="p-1.5 bg-brand-cyan text-black hover:bg-neutral-200 transition-colors rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-40"
                    title="Ping Node"
                  >
                    <RefreshCw size={12} className={validatorNodes[selectedValidator].state === "pinging" ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-4">
              <span>ACTIVE REGIONAL ENDPOINTS</span>
              <span>COMPLIANT STATUS PROTOCOL</span>
            </div>
          </div>

          {/* Bento Block 6: Tokenomics Donut Allocation Chart */}
          <div className="bento-card p-6 rounded-2xl bg-[#050507]/90 flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2">
                <Vote size={14} className="text-brand-purple" />
                Token Allocation (100M ASTRA)
              </h3>

              {/* SVG Donut */}
              <div className="relative flex justify-center mb-6 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="10"/>
                  
                  {/* Staking: 35% -> stroke-dasharray="35 65" stroke-dashoffset="0" */}
                  <circle 
                    cx="50" cy="50" r="38" fill="transparent" stroke="#9b66ff" strokeWidth={hoveredTokenomics === 0 ? "13" : "10"}
                    strokeDasharray="238.76" strokeDashoffset="0"
                    style={{ strokeDasharray: `${(35 / 100) * 238.76} 238.76`, transition: "all 0.3s" }}
                    onMouseEnter={() => setHoveredTokenomics(0)}
                    onMouseLeave={() => setHoveredTokenomics(null)}
                  />
                  {/* Ecosystem: 25% -> offset = 35% */}
                  <circle 
                    cx="50" cy="50" r="38" fill="transparent" stroke="#06b6d4" strokeWidth={hoveredTokenomics === 1 ? "13" : "10"}
                    strokeDasharray="238.76" strokeDashoffset="0"
                    style={{ strokeDasharray: `${(25 / 100) * 238.76} 238.76`, strokeDashoffset: `-${(35 / 100) * 238.76}`, transition: "all 0.3s" }}
                    onMouseEnter={() => setHoveredTokenomics(1)}
                    onMouseLeave={() => setHoveredTokenomics(null)}
                  />
                  {/* Treasury: 15% -> offset = 60% */}
                  <circle 
                    cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth={hoveredTokenomics === 2 ? "13" : "10"}
                    strokeDasharray="238.76" strokeDashoffset="0"
                    style={{ strokeDasharray: `${(15 / 100) * 238.76} 238.76`, strokeDashoffset: `-${(60 / 100) * 238.76}`, transition: "all 0.3s" }}
                    onMouseEnter={() => setHoveredTokenomics(2)}
                    onMouseLeave={() => setHoveredTokenomics(null)}
                  />
                  {/* Team: 15% -> offset = 75% */}
                  <circle 
                    cx="50" cy="50" r="38" fill="transparent" stroke="#4f46e5" strokeWidth={hoveredTokenomics === 3 ? "13" : "10"}
                    strokeDasharray="238.76" strokeDashoffset="0"
                    style={{ strokeDasharray: `${(15 / 100) * 238.76} 238.76`, strokeDashoffset: `-${(75 / 100) * 238.76}`, transition: "all 0.3s" }}
                    onMouseEnter={() => setHoveredTokenomics(3)}
                    onMouseLeave={() => setHoveredTokenomics(null)}
                  />
                  {/* Public: 10% -> offset = 90% */}
                  <circle 
                    cx="50" cy="50" r="38" fill="transparent" stroke="#ec4899" strokeWidth={hoveredTokenomics === 4 ? "13" : "10"}
                    strokeDasharray="238.76" strokeDashoffset="0"
                    style={{ strokeDasharray: `${(10 / 100) * 238.76} 238.76`, strokeDashoffset: `-${(90 / 100) * 238.76}`, transition: "all 0.3s" }}
                    onMouseEnter={() => setHoveredTokenomics(4)}
                    onMouseLeave={() => setHoveredTokenomics(null)}
                  />
                </svg>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none text-center">
                  <span className="text-gray-400 font-mono text-[9px] uppercase tracking-wider">
                    {currentTokenomics ? currentTokenomics.title : "Supply Pool"}
                  </span>
                  <span className="font-display font-extrabold text-white text-lg leading-none mt-1">
                    {currentTokenomics ? `${currentTokenomics.percentage}%` : "100.0M"}
                  </span>
                  <span className="text-gray-500 font-mono text-[9px] mt-0.5">
                    {currentTokenomics ? "Hovered" : "Total ASTRA"}
                  </span>
                </div>
              </div>

              {/* Hover description display */}
              <div className="min-h-[75px] bento-card p-3 rounded-xl bg-white/5 border-white/5 text-[11px] leading-relaxed">
                {currentTokenomics ? (
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-white">{currentTokenomics.title}</span>
                      <span style={{ color: currentTokenomics.color }} className="font-mono">{currentTokenomics.percentage}%</span>
                    </div>
                    <p className="text-gray-400 mb-1">{currentTokenomics.description}</p>
                    <span className="text-[9px] uppercase font-mono text-gray-500 flex items-center gap-1">
                      <Clock size={10} /> Vesting: {currentTokenomics.vesting}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-3">Hover over donut slices to reveal vesting terms, allocations, and specific pool configurations.</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic DAO Proposals Quick voting module */}
        <div className="w-full max-w-4xl text-left mb-24">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3">DAO Governance Portal</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Cast dynamic gasless meta-transaction votes directly from the validator network landing page.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {daoProposals.map((prop) => (
              <div key={prop.id} className="bento-card p-6 rounded-2xl flex flex-col justify-between bg-[#050507]/90 min-h-[160px]">
                <div>
                  <span className="text-[9px] uppercase font-mono text-brand-purple tracking-widest block mb-1">Proposal #{prop.id}</span>
                  <h3 className="font-display font-bold text-base text-white mb-2">{prop.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    {prop.id === 0 
                      ? "Increase the staking vault yields by 5.0% APY to boot incentives for node operators and validator liquidity pools."
                      : "Formulate cross-chain swaps relays utilizing Wormhole bridge cryptographic payloads directly to Base network."}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-400 font-semibold">{prop.votes.toLocaleString()} Votes cast</span>
                  <button
                    type="button"
                    onClick={() => handleQuickVote(prop.id)}
                    className="px-4 py-2 bg-brand-purple/20 hover:bg-brand-purple text-brand-purple hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all border border-brand-purple/20 hover:border-brand-purple"
                  >
                    Quick Vote (+1)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Socratic Accordion Technical FAQ */}
        <div className="w-full max-w-4xl text-left mb-24">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3">Socratic Technology Audit</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Explore core cryptographic implementations and decentralized infrastructure queries.</p>
          </div>

          <div className="flex flex-col gap-4">
            {[
              {
                q: "How does the SIWE cryptographic auth protocol function?",
                a: "Sign-In with Ethereum (SIWE) provides a passwordless authentication loop. The client retrieves a secure cryptographic nonce, requests a wallet private key signature containing session metadata, and sends the package to our Express backend. The server cryptographically validates the signature using ethers.js to generate a stateless HttpOnly JWT session cookie."
              },
              {
                q: "What decentralized storage mechanisms are deployed?",
                a: "Astraea coordinates dynamic IPFS gateways and Filecoin lockers. When minting custom assets, application metadata schemas and vector graphic files are compressed, uploaded to distributed storage nodes, and referenced via content-addressed IPFS CID hash keys."
              },
              {
                q: "How does the APY compound lock vault calculate rewards?",
                a: "The vault simulates a 10.0% compounding annual yield. Locked assets compile timestamps upon deposit. Upon withdraw triggers, block intervals are calculated to determine reward allocations, generating token expansions that are minted directly to your balance."
              },
              {
                q: "What is the function of the Redis Edge Caching layer?",
                a: "The cache acts as a middleware telemetry buffer. Because calling high-frequency RPC node pings over live block networks induces large fees and latency, our Upstash Redis cluster caches transaction logs, validator telemetry, and token supply stats for 60 seconds, reducing RPC call overhead by 92%."
              },
              {
                q: "Are the cross-chain bridge routers audited for security?",
                a: "Yes. The Wormhole messaging relayer configuration utilizes decentralized validators that verify lock/mint payloads on both source and destination chains. Signature relays operate with threshold multi-sigs, preventing fake-mint and reentrancy exploits."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bento-card rounded-2xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-white cursor-pointer hover:bg-white/5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={15} className="text-brand-purple" />
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={`text-gray-500 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} 
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-1 text-xs text-gray-400 leading-relaxed pl-12 border-t border-white/5 bg-white/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Email Whitelist early-access form */}
        <div className="w-full max-w-xl bento-card p-8 rounded-3xl text-center border border-white/5 bg-[#050507]/90 mb-10">
          <div className="h-10 w-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan mx-auto mb-4">
            <Award size={20} />
          </div>
          <h2 className="font-display font-bold text-lg text-white mb-2">Request Early Access Key</h2>
          <p className="text-gray-400 text-xs mb-6 max-w-xs mx-auto">
            Get whitelisted for the upcoming Astraea mainnet nodes deployment and early validator token distributions.
          </p>

          <form onSubmit={handleWhitelist} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="pioneer@protocol.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow px-4 py-3 rounded-xl bento-card border-white/5 text-xs outline-none text-white focus:border-brand-cyan bg-[#030303]"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-black font-display font-semibold rounded-xl text-xs tracking-wider cursor-pointer hover:bg-neutral-200 transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              <Send size={12} />
              Register Key
            </button>
          </form>

          {whitelistStatus && (
            <div className="mt-4 text-[10px] text-brand-cyan font-semibold animate-pulse">
              {whitelistStatus}
            </div>
          )}
        </div>

      </section>
    </div>
  );
}

