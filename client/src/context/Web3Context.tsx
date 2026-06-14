"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider, formatEther, parseEther } from "ethers";

interface Web3ContextType {
  isConnected: boolean;
  address: string | null;
  network: string | null;
  balance: string | null;
  signer: any | null;
  provider: BrowserProvider | null;
  loading: boolean;
  isDemoMode: boolean;
  connectWallet: (walletType?: string) => Promise<boolean>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (networkName: string) => Promise<boolean>;
  signMessage: (message: string) => Promise<string | null>;
  sendTransaction: (to: string, amount: string) => Promise<string | null>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [signer, setSigner] = useState<any | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Network specifications
  const NETWORKS: { [key: string]: { chainId: string; chainName: string; rpcUrls: string[]; nativeCurrency: { name: string; symbol: string; decimals: number } } } = {
    ethereum: {
      chainId: "0x1",
      chainName: "Ethereum Mainnet",
      rpcUrls: ["https://cloudflare-eth.com"],
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }
    },
    sepolia: {
      chainId: "0xaa36a7",
      chainName: "Sepolia Test Network",
      rpcUrls: ["https://rpc.sepolia.org"],
      nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 }
    },
    polygon: {
      chainId: "0x89",
      chainName: "Polygon Mainnet",
      rpcUrls: ["https://polygon-rpc.com"],
      nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 }
    },
    amoy: {
      chainId: "0x13882",
      chainName: "Polygon Amoy Testnet",
      rpcUrls: ["https://rpc-amoy.polygon.technology"],
      nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 }
    }
  };

  // Check if wallet is already connected on boot
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const browserProvider = new BrowserProvider((window as any).ethereum);
          const accounts = await browserProvider.listAccounts();
          
          if (accounts.length > 0) {
            setProvider(browserProvider);
            const userSigner = await browserProvider.getSigner();
            setSigner(userSigner);
            const userAddress = await userSigner.getAddress();
            setAddress(userAddress);
            
            const net = await browserProvider.getNetwork();
            setNetwork(getNetworkName(net.chainId));
            
            const bal = await browserProvider.getBalance(userAddress);
            setBalance(parseFloat(formatEther(bal)).toFixed(4));
            setIsConnected(true);
            setIsDemoMode(false);
          }
        } catch (err) {
          console.warn("Auto-reconnect error", err);
        }
      }
    };
    checkConnection();
  }, []);

  const getNetworkName = (chainId: bigint | number): string => {
    const id = Number(chainId);
    if (id === 1) return "ethereum";
    if (id === 11155111) return "sepolia";
    if (id === 137) return "polygon";
    if (id === 80002) return "amoy";
    return `unknown (Chain ID: ${id})`;
  };

  const connectWallet = async (walletType: string = "metamask"): Promise<boolean> => {
    setLoading(true);
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const browserProvider = new BrowserProvider((window as any).ethereum);
        // Request accounts
        await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        
        setProvider(browserProvider);
        const userSigner = await browserProvider.getSigner();
        setSigner(userSigner);
        
        const userAddress = await userSigner.getAddress();
        setAddress(userAddress);
        
        const net = await browserProvider.getNetwork();
        setNetwork(getNetworkName(net.chainId));
        
        const bal = await browserProvider.getBalance(userAddress);
        setBalance(parseFloat(formatEther(bal)).toFixed(4));
        
        setIsConnected(true);
        setIsDemoMode(false);
        setLoading(false);
        return true;
      } else {
        // Fallback to high-quality interactive demo mode
        console.log("No web3 browser wallet detected. Entering demo environment.");
        setIsDemoMode(true);
        setIsConnected(true);
        setAddress("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
        setNetwork("sepolia");
        setBalance("100.0000");
        setLoading(false);
        return true;
      }
    } catch (err) {
      console.error("Wallet connection failed", err);
      setLoading(false);
      return false;
    }
  };

  const disconnectWallet = async () => {
    setAddress(null);
    setNetwork(null);
    setBalance(null);
    setSigner(null);
    setProvider(null);
    setIsConnected(false);
    setIsDemoMode(false);
  };

  const switchNetwork = async (networkName: string): Promise<boolean> => {
    const netDetails = NETWORKS[networkName];
    if (!netDetails) return false;

    if (isDemoMode) {
      setNetwork(networkName);
      setBalance(networkName === "polygon" || networkName === "amoy" ? "250.75" : "100.0000");
      return true;
    }

    if (!provider || !(window as any).ethereum) return false;

    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: netDetails.chainId }],
      });
      
      const newProvider = new BrowserProvider((window as any).ethereum);
      const net = await newProvider.getNetwork();
      setNetwork(getNetworkName(net.chainId));
      
      if (address) {
        const bal = await newProvider.getBalance(address);
        setBalance(parseFloat(formatEther(bal)).toFixed(4));
      }
      return true;
    } catch (err: any) {
      // Chain not added error: 4902
      if (err.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: netDetails.chainId,
                chainName: netDetails.chainName,
                rpcUrls: netDetails.rpcUrls,
                nativeCurrency: netDetails.nativeCurrency,
              },
            ],
          });
          return true;
        } catch (addErr) {
          console.error("Failed to add network", addErr);
        }
      }
      console.error("Failed to switch network", err);
      return false;
    }
  };

  const signMessage = async (message: string): Promise<string | null> => {
    if (isDemoMode) {
      // Simulated signature
      return "0x78a5b28d8a7c8be558db60b9385d85207cbf4e1564f8de42a229a9978119c8d350529d4791ea9e29fbe94156c7cf6ebfbf104193582ceef8987bcf9509df63bb1c";
    }

    if (!signer) return null;

    try {
      return await signer.signMessage(message);
    } catch (err) {
      console.error("Message signing error", err);
      return null;
    }
  };

  const sendTransaction = async (to: string, amount: string): Promise<string | null> => {
    if (isDemoMode) {
      // Return a simulated txHash
      return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    }

    if (!signer) return null;

    try {
      const tx = await signer.sendTransaction({
        to,
        value: parseEther(amount),
      });
      return tx.hash;
    } catch (err) {
      console.error("Transaction sending failed", err);
      return null;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        isConnected,
        address,
        network,
        balance,
        signer,
        provider,
        loading,
        isDemoMode,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        signMessage,
        sendTransaction,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
