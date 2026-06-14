"use client";

import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { useAuth } from "../../context/AuthContext";
import { 
  TrendingUp, Wallet, ArrowLeftRight, Coins, Vote, Search, MessageSquareCode, 
  Settings, ShieldCheck, PlusCircle, Send, Sparkles, RefreshCw, BarChart2,
  Cpu, ArrowUpRight, ArrowDownRight, Globe
} from "lucide-react";
import confetti from "canvas-confetti";

interface NFTItem {
  id: string;
  name: string;
  uri: string;
  image: string;
}

interface Proposal {
  id: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  endTime: string;
  executed: boolean;
}

// Reusable Dynamic SVG Area Chart for Premium look
const AreaChart = ({ data, color }: { data: number[]; color: string }) => {
  const width = 500;
  const height = 120;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 30) - 15;
    return `${x},${y}`;
  }).join(" ");
  
  const fillPoints = `0,${height} ${points} ${width},${height}`;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[120px] overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#grad-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={2.0} strokeLinecap="round" />
    </svg>
  );
};

export default function Dashboard() {
  const { isConnected, address, balance, network, connectWallet, switchNetwork, sendTransaction, signMessage } = useWeb3();
  const { authenticated, userProfile, loginHistory, authLoading, loginWithWallet, logoutUser } = useAuth();

  const [activeTab, setActiveTab] = useState("portfolio");

  // Telemetry charts mock data
  const chartData = [10, 15, 12, 19, 24, 21, 28, 30, 27, 34];
  const activeUserMetrics = [120, 140, 130, 160, 210, 205, 230, 260, 285];

  // State Management
  const [nfts, setNfts] = useState<NFTItem[]>([
    { id: "0", name: "Genesis Element", uri: "ipfs://...", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&auto=format&fit=crop&q=60" },
    { id: "1", name: "Astraea Catalyst", uri: "ipfs://...", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60" },
  ]);
  const [mintName, setMintName] = useState("");
  const [mintImage, setMintImage] = useState("https://images.unsplash.com/photo-1644024222384-a15998a69d7b?w=500&auto=format&fit=crop&q=60");
  const [mintingStatus, setMintingStatus] = useState("");

  const [swapFrom, setSwapFrom] = useState("ETH");
  const [swapTo, setSwapTo] = useState("ASTRA");
  const [swapAmount, setSwapAmount] = useState("1.0");
  const [swapResult, setSwapResult] = useState("2000");
  const [swapStatus, setSwapStatus] = useState("");

  const [stakedAmount, setStakedAmount] = useState("");
  const [userStaked, setUserStaked] = useState(0);
  const [stakeRewards, setStakeRewards] = useState(0);
  const [stakingStatus, setStakingStatus] = useState("");

  const [proposals, setProposals] = useState<Proposal[]>([
    { id: 0, title: "Upgrade Staking APY to 15%", description: "Increase core validator staking yield to motivate locked liquidity.", votesFor: 12500, votesAgainst: 4200, endTime: new Date(Date.now() + 864000000).toISOString(), executed: false },
    { id: 1, title: "Wormhole Bridge Deploy", description: "Bootstrap cross-chain liquidity pool on Arbitrum and Polygon via Wormhole.", votesFor: 870, votesAgainst: 1200, endTime: new Date(Date.now() - 3600000).toISOString(), executed: false }
  ]);
  const [newPropTitle, setNewPropTitle] = useState("");
  const [newPropDesc, setNewPropDesc] = useState("");

  const [blocks, setBlocks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: "ai", text: "Welcome to Astraea AI Advisor. Ask me anything about yields, nodes, smart contracts, or SIWE security." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Admin node configs
  const [nodes, setNodes] = useState([
    { network: "ethereum", rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/...", provider: "Alchemy", isActive: true },
    { network: "sepolia", rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/...", provider: "Alchemy", isActive: true },
    { network: "polygon", rpcUrl: "https://polygon-mainnet.g.alchemy.com/v2/...", provider: "Alchemy", isActive: true },
  ]);
  const [nodeInputUrl, setNodeInputUrl] = useState("");

  // Blocks poll
  useEffect(() => {
    const initialBlocks = Array.from({ length: 6 }, (_, i) => ({
      height: 18593810 - i,
      hash: "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      txs: Math.floor(Math.random() * 120) + 40,
      gasUsed: "12,450,210",
      timestamp: new Date(Date.now() - i * 12000).toLocaleTimeString()
    }));
    setBlocks(initialBlocks);

    const interval = setInterval(() => {
      setBlocks(prev => [
        {
          height: prev[0].height + 1,
          hash: "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          txs: Math.floor(Math.random() * 120) + 40,
          gasUsed: "14,120,580",
          timestamp: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 5)
      ]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Update swap calculation
  useEffect(() => {
    const amt = parseFloat(swapAmount) || 0;
    if (swapFrom === "ETH") {
      setSwapResult((amt * 2000).toFixed(2));
    } else {
      setSwapResult((amt / 2000).toFixed(6));
    }
  }, [swapAmount, swapFrom]);

  const triggerCelebration = () => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  };

  // NFT Minting Simulator
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintName) return;
    setMintingStatus("Requesting wallet signature...");
    
    const sig = await signMessage(`Mint Astraea Element: ${mintName}`);
    if (!sig) {
      setMintingStatus("Signature denied.");
      return;
    }

    setMintingStatus("Broadcasting transaction...");
    const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    
    try {
      await fetch("http://localhost:5000/api/dashboard/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash, from: address, to: "AstraeaNFT", amount: "0.05", network: network || "sepolia", status: "SUCCESS" }),
        credentials: "include"
      });
    } catch (err) {}

    setTimeout(() => {
      const newNft = {
        id: nfts.length.toString(),
        name: mintName,
        uri: `ipfs://bafy.../${nfts.length}`,
        image: mintImage
      };
      setNfts([...nfts, newNft]);
      setTransactions(prev => [{ hash: txHash, type: "Mint NFT", desc: mintName, status: "SUCCESS" }, ...prev]);
      setMintName("");
      setMintingStatus("NFT Minted successfully!");
      triggerCelebration();
    }, 2000);
  };

  // Staking Simulator
  const handleStake = async (type: "stake" | "unstake") => {
    const amt = parseFloat(stakedAmount) || 0;
    if (amt <= 0) return;
    setStakingStatus("Signing lock contract...");

    const sig = await signMessage(`${type === "stake" ? "Stake" : "Unstake"} ${amt} ASTRA`);
    if (!sig) {
      setStakingStatus("Cancelled.");
      return;
    }

    setStakingStatus("Transmitting transaction...");
    setTimeout(() => {
      if (type === "stake") {
        setUserStaked(prev => prev + amt);
        setStakingStatus(`Staked ${amt} ASTRA successfully!`);
      } else {
        const reward = userStaked * 0.1;
        setUserStaked(prev => Math.max(0, prev - amt));
        setStakeRewards(prev => prev + reward);
        setStakingStatus(`Unstaked ${amt} ASTRA.`);
      }
      setStakedAmount("");
      triggerCelebration();
    }, 1500);
  };

  // Swapping Simulator
  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setSwapStatus("Generating quote...");
    const hash = await sendTransaction("0x0000000000000000000000000000000000000000", swapAmount);
    if (!hash) {
      setSwapStatus("Swap failed.");
      return;
    }
    
    setSwapStatus("Executing transaction...");
    setTimeout(() => {
      setSwapStatus("Swap executed successfully!");
      setTransactions(prev => [{ hash, type: "Token Swap", desc: `${swapAmount} ${swapFrom} -> ${swapResult} ${swapTo}`, status: "SUCCESS" }, ...prev]);
      triggerCelebration();
    }, 1500);
  };

  // DAO Voting Simulator
  const handleVote = async (propId: number, support: boolean) => {
    const sig = await signMessage(`Vote on Proposal #${propId}: ${support ? "FOR" : "AGAINST"}`);
    if (!sig) return;

    setProposals(prev => prev.map(p => {
      if (p.id === propId) {
        return {
          ...p,
          votesFor: support ? p.votesFor + 100 : p.votesFor,
          votesAgainst: !support ? p.votesAgainst + 100 : p.votesAgainst
        };
      }
      return p;
    }));
    triggerCelebration();
  };

  // Create DAO Proposal Simulator
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropTitle || !newPropDesc) return;
    
    const sig = await signMessage(`Create Proposal: ${newPropTitle}`);
    if (!sig) return;

    const newProp: Proposal = {
      id: proposals.length,
      title: newPropTitle,
      description: newPropDesc,
      votesFor: 100,
      votesAgainst: 0,
      endTime: new Date(Date.now() + 86400000).toISOString(),
      executed: false
    };

    setProposals([...proposals, newProp]);
    setNewPropTitle("");
    setNewPropDesc("");
    triggerCelebration();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setChatLoading(true);

    setTimeout(() => {
      let aiText = "I can help explain yields, smart contracts, and auth. Please ask specific technical questions.";
      const text = userText.toLowerCase();
      
      if (text.includes("staking") || text.includes("yield")) {
        aiText = "The Astraea Staking Vault offers an annual percentage yield (APY) of 10.0%, compounded dynamically. Yield is generated through validator validator node operations.";
      } else if (text.includes("gas") || text.includes("fee")) {
        aiText = "EVM Gas prices average 25-45 Gwei on Sepolia. Polygon Amoy fees are highly optimized, usually under 0.01 POL.";
      } else if (text.includes("siwe") || text.includes("auth") || text.includes("jwt")) {
        aiText = "Sign-In with Ethereum (SIWE) verifies possession of the private key without exposing passwords. The backend decodes the cryptographic signature, matches the session nonce, and issues a secure stateless JWT cookie.";
      } else if (text.includes("bridge") || text.includes("cross")) {
        aiText = "Cross-chain operations leverage Wormhole and Cosmos IBC protocol frameworks. Transactions execute a lock-and-mint proxy mechanism to bridge assets.";
      }

      setChatMessages(prev => [...prev, { sender: "ai", text: aiText }]);
      setChatLoading(false);
    }, 1200);
  };

  if (!isConnected) {
    return (
      <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-24 flex flex-col items-center justify-center relative z-10 grid-lines">
        <div className="bento-card max-w-lg w-full p-8 rounded-3xl text-center border border-white/5 shadow-2xl flex flex-col items-center gap-6 bg-[#08080a]/90">
          <div className="h-12 w-12 rounded-xl bg-brand-purple/10 flex items-center justify-center text-brand-purple">
            <Wallet size={24} />
          </div>
          <h2 className="font-display font-bold text-xl tracking-wider text-white">ACCESS THE WORKSPACE</h2>
          <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
            Please connect your Web3 wallet extension to authorize, access live analytics, sign transactions, and configure validator node interfaces.
          </p>
          <button
            onClick={() => connectWallet()}
            className="w-full py-3 bg-white text-black font-display font-semibold rounded-xl text-xs tracking-wider cursor-pointer shadow-lg hover:bg-neutral-200 transition-all active:scale-95"
          >
            Connect Web3 Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-24 flex flex-col items-center justify-center relative z-10 grid-lines">
        <div className="bento-card max-w-lg w-full p-8 rounded-3xl text-center border border-white/5 shadow-2xl flex flex-col items-center gap-6 bg-[#08080a]/90">
          <div className="h-12 w-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
            <ShieldCheck size={24} />
          </div>
          <h2 className="font-display font-bold text-xl tracking-wider text-white">SECURE AUTHENTICATION</h2>
          <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
            Your wallet is connected. Now sign a cryptographic SIWE handshake message to authorize your profile and generate a JWT session cookie.
          </p>
          <button
            onClick={loginWithWallet}
            disabled={authLoading}
            className="w-full py-3 bg-white text-black font-display font-semibold rounded-xl text-xs tracking-wider cursor-pointer shadow-lg hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {authLoading ? "Verifying..." : "Sign Verification Handshake"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
      
      {/* Sidebar navigation */}
      <div className="lg:col-span-1 flex flex-col gap-2">
        <div className="bento-card p-4 rounded-xl flex items-center gap-3 bg-[#08080a]/80">
          <div className="h-9 w-9 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-display font-bold text-xs">
            AP
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[10px] font-bold text-gray-500 tracking-wider">WORKSPACE</span>
            <span className="text-xs font-semibold truncate text-white">{userProfile?.name}</span>
          </div>
        </div>

        {[
          { id: "portfolio", label: "Balances & NFTs", icon: <Wallet size={15} /> },
          { id: "swap", label: "Token Swap", icon: <ArrowLeftRight size={15} /> },
          { id: "staking", label: "Vault Staking", icon: <Coins size={15} /> },
          { id: "dao", label: "DAO Governance", icon: <Vote size={15} /> },
          { id: "explorer", label: "Node Explorer", icon: <Search size={15} /> },
          { id: "ai", label: "Astraea AI", icon: <MessageSquareCode size={15} /> },
          ...(userProfile?.role === "ADMIN" ? [{ id: "admin", label: "Settings & Audits", icon: <Settings size={15} /> }] : [])
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full py-3 px-4 rounded-xl text-left text-xs font-semibold flex items-center gap-3 cursor-pointer transition-all ${
              activeTab === tab.id 
                ? "bg-white text-black shadow-lg shadow-white/5" 
                : "bento-card text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Workspace Frame */}
      <div className="lg:col-span-3 flex flex-col gap-6">

        {/* Tab 1: Balances & NFTs */}
        {activeTab === "portfolio" && (
          <div className="flex flex-col gap-6">
            {/* Bento Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bento-card p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Wallet Balance</span>
                  <h3 className="font-display font-bold text-xl text-white mt-1">{balance} ETH</h3>
                  <span className="text-[10px] text-brand-green font-semibold uppercase tracking-wider">Connected & Audited</span>
                </div>
                <div className="p-2.5 bg-brand-purple/10 rounded-xl text-brand-purple">
                  <Wallet size={20} />
                </div>
              </div>
              <div className="bento-card p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ASTRA Lock Vault</span>
                  <h3 className="font-display font-bold text-xl text-white mt-1">
                    {(userStaked + stakeRewards).toFixed(2)} ASTRA
                  </h3>
                  <span className="text-[10px] text-brand-cyan font-semibold uppercase tracking-wider">Compounding 10% APY</span>
                </div>
                <div className="p-2.5 bg-brand-cyan/10 rounded-xl text-brand-cyan">
                  <Coins size={20} />
                </div>
              </div>
            </div>

            {/* SVG Telemetry Area Chart */}
            <div className="bento-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">TELEMETRY</span>
                  <h4 className="font-display font-bold text-base text-white">Live Node Query Speeds (ms)</h4>
                </div>
                <span className="text-xs text-brand-purple font-mono font-semibold uppercase">Real-time</span>
              </div>
              <div className="w-full flex items-end">
                <AreaChart data={chartData} color="#8b5cf6" />
              </div>
            </div>

            {/* NFT Minting */}
            <div className="bento-card p-6 rounded-2xl">
              <h3 className="font-display font-bold text-base mb-4 text-white">Mint Astraea Element NFT</h3>
              <form onSubmit={handleMint} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Element name (e.g. Ether Core)"
                  value={mintName}
                  onChange={(e) => setMintName(e.target.value)}
                  className="sm:col-span-2 px-4 py-3 rounded-xl bento-card border-white/5 text-xs outline-none text-white focus:border-brand-purple"
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-white text-black font-display font-semibold rounded-xl text-xs tracking-wider cursor-pointer flex items-center justify-center gap-1.5 hover:bg-neutral-200"
                >
                  <PlusCircle size={13} />
                  Mint NFT
                </button>
              </form>
              {mintingStatus && (
                <div className="mt-3 text-[10px] text-brand-cyan flex items-center gap-1.5">
                  <Sparkles size={10} className="animate-spin" />
                  <span>{mintingStatus}</span>
                </div>
              )}
            </div>

            {/* NFT Gallery */}
            <div className="bento-card p-6 rounded-2xl">
              <h3 className="font-display font-bold text-base mb-4 text-white">NFT Inventory</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {nfts.map(nft => (
                  <div key={nft.id} className="relative group overflow-hidden rounded-xl border border-white/5 bg-white/5 p-2 bento-card shadow-lg">
                    <img 
                      src={nft.image} 
                      alt={nft.name} 
                      className="h-32 w-full object-cover rounded-lg group-hover:scale-102 transition-transform duration-300" 
                    />
                    <div className="mt-2 px-1">
                      <h4 className="font-semibold text-xs truncate text-white">{nft.name}</h4>
                      <span className="text-[9px] text-gray-500 font-mono">ID #{nft.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Swap */}
        {activeTab === "swap" && (
          <div className="bento-card p-6 rounded-2xl max-w-lg mx-auto w-full">
            <h3 className="font-display font-bold text-base text-white mb-6">Standard Swap Router</h3>
            <form onSubmit={handleSwap} className="flex flex-col gap-4">
              <div className="bento-card p-4 rounded-xl">
                <span className="text-[10px] text-gray-500 block">Pay</span>
                <div className="flex items-center justify-between mt-1">
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    className="w-1/2 bg-transparent text-lg font-bold font-mono outline-none text-white"
                  />
                  <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-semibold">{swapFrom}</span>
                </div>
              </div>

              <div className="bento-card p-4 rounded-xl">
                <span className="text-[10px] text-gray-500 block">Receive (Estimated)</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-bold font-mono text-gray-400">{swapResult}</span>
                  <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-semibold">{swapTo}</span>
                </div>
              </div>

              <div className="text-[10px] text-gray-500 flex justify-between px-1">
                <span>Network Fee</span>
                <span className="text-brand-cyan">~0.0028 ETH (~$9.50)</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white text-black font-display font-semibold rounded-xl text-xs tracking-wider cursor-pointer flex items-center justify-center gap-1.5 hover:bg-neutral-200"
              >
                Execute Swap Contract
              </button>
            </form>
            {swapStatus && (
              <div className="mt-4 text-[10px] text-brand-cyan flex items-center gap-1.5">
                <Sparkles size={10} className="animate-spin" />
                <span>{swapStatus}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Staking */}
        {activeTab === "staking" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bento-card p-5 rounded-xl text-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Locked Yield</span>
                <h4 className="font-display font-bold text-lg text-brand-green mt-1">10.0% APY</h4>
              </div>
              <div className="bento-card p-5 rounded-xl text-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Active Stake</span>
                <h4 className="font-display font-bold text-lg text-white mt-1">{userStaked} ASTRA</h4>
              </div>
              <div className="bento-card p-5 rounded-xl text-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Pending Yield</span>
                <h4 className="font-display font-bold text-lg text-white mt-1">{stakeRewards.toFixed(2)} ASTRA</h4>
              </div>
            </div>

            <div className="bento-card p-6 rounded-2xl max-w-lg mx-auto w-full">
              <h3 className="font-display font-bold text-base mb-4 text-white font-display">Staking Vault Actions</h3>
              <div className="flex flex-col gap-4">
                <div className="bento-card p-4 rounded-xl">
                  <span className="text-[10px] text-gray-500 block">Staking Vault Input</span>
                  <input
                    type="number"
                    placeholder="Enter amount of ASTRA"
                    value={stakedAmount}
                    onChange={(e) => setStakedAmount(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold font-mono outline-none text-white mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleStake("stake")}
                    className="py-3 bg-white text-black font-display font-semibold rounded-xl text-xs tracking-wider cursor-pointer flex items-center justify-center hover:bg-neutral-200"
                  >
                    Stake Tokens
                  </button>
                  <button
                    onClick={() => handleStake("unstake")}
                    className="py-3 border border-white/5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center hover:bg-white/5"
                  >
                    Unstake & Claim
                  </button>
                </div>
              </div>
              {stakingStatus && (
                <div className="mt-4 text-[10px] text-brand-cyan flex items-center gap-1.5">
                  <Sparkles size={10} className="animate-spin" />
                  <span>{stakingStatus}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: DAO */}
        {activeTab === "dao" && (
          <div className="flex flex-col gap-6">
            <div className="bento-card p-6 rounded-2xl">
              <h3 className="font-display font-bold text-base text-white mb-4">Active Proposals</h3>
              <div className="flex flex-col gap-4">
                {proposals.map(p => (
                  <div key={p.id} className="bento-card p-5 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple uppercase font-semibold">
                          PROPOSAL #{p.id}
                        </span>
                        <h4 className="font-display font-bold text-sm text-white mt-1">{p.title}</h4>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">
                        Ends: {new Date(p.endTime).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{p.description}</p>
                    
                    <div className="flex flex-col gap-1 text-[10px] text-gray-500">
                      <div className="flex justify-between">
                        <span>For: {p.votesFor} ASTRA</span>
                        <span>Against: {p.votesAgainst} ASTRA</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan" 
                          style={{ width: `${(p.votesFor / (p.votesFor + p.votesAgainst || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleVote(p.id, true)}
                        className="px-3 py-1 bg-brand-purple/10 hover:bg-brand-purple text-brand-purple hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Vote For
                      </button>
                      <button
                        onClick={() => handleVote(p.id, false)}
                        className="px-3 py-1 border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Vote Against
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bento-card p-6 rounded-2xl">
              <h3 className="font-display font-bold text-base text-white mb-4">Submit Proposal</h3>
              <form onSubmit={handleCreateProposal} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Proposal Title"
                  value={newPropTitle}
                  onChange={(e) => setNewPropTitle(e.target.value)}
                  className="px-4 py-3 rounded-xl bento-card border-white/5 text-xs outline-none text-white focus:border-brand-purple"
                />
                <textarea
                  placeholder="Describe your proposal details..."
                  value={newPropDesc}
                  rows={3}
                  onChange={(e) => setNewPropDesc(e.target.value)}
                  className="px-4 py-3 rounded-xl bento-card border-white/5 text-xs outline-none text-white focus:border-brand-purple resize-none"
                />
                <button
                  type="submit"
                  className="py-3 bg-white text-black font-display font-semibold rounded-xl text-xs tracking-wider cursor-pointer flex items-center justify-center hover:bg-neutral-200"
                >
                  Submit Proposal
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 5: Node Explorer */}
        {activeTab === "explorer" && (
          <div className="flex flex-col gap-6">
            <div className="bento-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <RefreshCw size={15} className="animate-spin text-brand-purple" />
                  Live Blocks
                </h3>
                <span className="text-[10px] text-gray-500">Latency: 24ms</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {blocks.map(b => (
                  <div key={b.height} className="bento-card p-4 rounded-xl flex flex-col gap-1 relative overflow-hidden bg-white/5">
                    <span className="text-[9px] font-bold text-brand-purple">BLOCK #{b.height}</span>
                    <span className="text-[9px] text-gray-500 font-mono truncate">{b.hash}</span>
                    <div className="flex justify-between text-[9px] text-gray-400 mt-2">
                      <span>{b.txs} Txs</span>
                      <span>{b.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Local signed receipts */}
            <div className="bento-card p-6 rounded-2xl">
              <h3 className="font-display font-bold text-base text-white mb-4">Local Transaction Receipts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-gray-500 uppercase border-b border-white/5 font-mono text-[10px]">
                      <th className="py-2.5">Type</th>
                      <th className="py-2.5">Receipt Hash</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-gray-500 font-mono">
                          No local transactions logged in this session.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx, idx) => (
                        <tr key={idx} className="border-b border-white/5">
                          <td className="py-3 font-semibold text-brand-cyan">{tx.type}</td>
                          <td className="py-3 font-mono text-gray-400 truncate max-w-xs">{tx.desc || tx.hash}</td>
                          <td className="py-3 text-right">
                            <span className="px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green font-semibold">
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: AI Assistant */}
        {activeTab === "ai" && (
          <div className="bento-card p-6 rounded-2xl h-[480px] flex flex-col">
            <h3 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-purple animate-pulse" />
              Astraea AI Assistant
            </h3>

            <div className="flex-grow overflow-y-auto flex flex-col gap-3 mb-4 pr-1">
              {chatMessages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === "ai" 
                      ? "bento-card text-gray-300 self-start" 
                      : "bg-white text-black self-end font-semibold shadow-lg"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {chatLoading && (
                <div className="bento-card max-w-md p-3 rounded-2xl text-xs text-gray-500 self-start animate-pulse flex items-center gap-1.5">
                  <Sparkles size={12} className="animate-spin text-brand-purple" />
                  Compiling response...
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto">
              <input
                type="text"
                placeholder="Ask about APYs, gas prices, or bridge contract parameters..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-grow px-4 py-3 rounded-xl bento-card border-white/5 text-xs outline-none text-white focus:border-brand-purple"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-white text-black rounded-xl hover:bg-neutral-200 cursor-pointer flex items-center justify-center"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        )}

        {/* Tab 7: Admin Panel */}
        {activeTab === "admin" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bento-card p-6 rounded-2xl">
                <h3 className="font-display font-bold text-base text-white mb-4">Add RPC Node</h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!nodeInputUrl) return;
                    setNodes([...nodes, { network: "custom", rpcUrl: nodeInputUrl, provider: "Custom", isActive: true }]);
                    setNodeInputUrl("");
                    triggerCelebration();
                  }}
                  className="flex flex-col gap-4"
                >
                  <input
                    type="text"
                    placeholder="RPC URL endpoint"
                    value={nodeInputUrl}
                    onChange={(e) => setNodeInputUrl(e.target.value)}
                    className="px-4 py-3 rounded-xl bento-card border-white/5 text-xs outline-none text-white focus:border-brand-purple"
                  />
                  <button
                    type="submit"
                    className="py-3 bg-white text-black font-display font-semibold rounded-xl text-xs tracking-wider cursor-pointer hover:bg-neutral-200"
                  >
                    Activate RPC Node
                  </button>
                </form>
              </div>

              {/* Node status list */}
              <div className="bento-card p-6 rounded-2xl">
                <h3 className="font-display font-bold text-base text-white mb-4">RPC Node Telemetry</h3>
                <div className="flex flex-col gap-3">
                  {nodes.map((n, idx) => (
                    <div key={idx} className="bento-card p-3 rounded-xl flex items-center justify-between text-xs bg-white/5">
                      <div>
                        <span className="font-semibold capitalize text-white">{n.network}</span>
                        <span className="text-[9px] text-gray-500 font-mono block truncate max-w-[150px]">{n.rpcUrl}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-400 font-semibold">{n.provider}</span>
                        <span className={`h-2 w-2 rounded-full ${n.isActive ? "bg-brand-green animate-pulse" : "bg-red-500"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom SVG Active Users telemetry chart */}
            <div className="bento-card p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">ANALYTICS</span>
                  <h4 className="font-display font-bold text-base text-white">Active Connection Streams</h4>
                </div>
                <span className="text-xs text-brand-cyan font-mono font-semibold uppercase">Daily stats</span>
              </div>
              <div className="w-full flex items-end">
                <AreaChart data={activeUserMetrics} color="#06b6d4" />
              </div>
            </div>

            {/* Login history audits */}
            <div className="bento-card p-6 rounded-2xl">
              <h3 className="font-display font-bold text-base text-white mb-4">Authentication Audit Logs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-gray-500 border-b border-white/5 font-mono text-[10px]">
                      <th className="py-2">Client IP</th>
                      <th className="py-2 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.map((log, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="py-2.5 font-mono">{log.ip}</td>
                        <td className="py-2.5 text-right text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
