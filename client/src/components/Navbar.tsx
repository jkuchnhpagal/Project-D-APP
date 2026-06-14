"use client";

import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../context/AuthContext";
import { Globe, Sun, Moon, Link2, ShieldCheck, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";

export const Navbar = ({ theme, toggleTheme, language, setLanguage }: { 
  theme: string; 
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
}) => {
  const { isConnected, address, balance, network, connectWallet, disconnectWallet, switchNetwork } = useWeb3();
  const { authenticated, loginWithWallet, logoutUser, authLoading } = useAuth();
  
  const [networkDropdown, setNetworkDropdown] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);

  const handleConnect = async () => {
    const success = await connectWallet();
    if (success) {
      await loginWithWallet();
    }
  };

  const handleDisconnect = async () => {
    await logoutUser();
    await disconnectWallet();
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const TRANSLATIONS: { [key: string]: { [key: string]: string } } = {
    en: { connect: "Connect Wallet", disconnect: "Disconnect", dashboard: "Dashboard", signin: "Sign In", authenticating: "Verifying...", authenticated: "Secured" },
    es: { connect: "Conectar Cartera", disconnect: "Desconectar", dashboard: "Panel", signin: "Ingresar", authenticating: "Verificando...", authenticated: "Asegurado" },
    zh: { connect: "连接钱包", disconnect: "断开连接", dashboard: "控制台", signin: "签名登录", authenticating: "验证中...", authenticated: "安全连接" },
    jp: { connect: "ウォレット接続", disconnect: "接続解除", dashboard: "ダッシュボード", signin: "サインイン", authenticating: "検証中...", authenticated: "認証済み" },
  };

  const t = (key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"][key];
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#030303]/60 backdrop-blur-md">
      {/* Left: Brand */}
      <Link href="/" className="flex items-center gap-2">
        <img 
          src="/logo.png" 
          alt="Astraea Logo" 
          className="h-8 w-8 rounded-lg object-contain shadow-md shadow-brand-purple/15" 
        />
        <span className="font-display font-bold text-base tracking-tight text-white light-theme:text-slate-900">
          ASTRAEA
        </span>
      </Link>

      {/* Middle: Links */}
      <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-400">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <Link href="/dashboard" className="hover:text-white transition-colors">
          {t("dashboard")}
        </Link>
        <a href="#features" className="hover:text-white transition-colors">
          Features
        </a>
      </div>

      {/* Right: Wallet Actions & Toggles */}
      <div className="flex items-center gap-4">
        {/* Network Selector */}
        {isConnected && network && (
          <div className="relative">
            <button
              onClick={() => setNetworkDropdown(!networkDropdown)}
              className="bento-card px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></span>
              <span className="capitalize">{network}</span>
              <ChevronDown size={10} />
            </button>

            {networkDropdown && (
              <div className="absolute right-0 mt-1.5 w-36 rounded-lg bento-card p-1 text-[10px] z-50 flex flex-col gap-0.5 bg-[#08080a]">
                {["ethereum", "sepolia", "polygon", "amoy"].map((net) => (
                  <button
                    key={net}
                    onClick={() => {
                      switchNetwork(net);
                      setNetworkDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer capitalize text-gray-400 hover:text-white transition-colors"
                  >
                    {net}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLangDropdown(!langDropdown)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-gray-400 hover:text-white"
          >
            <Globe size={15} />
          </button>
          {langDropdown && (
            <div className="absolute right-0 mt-1.5 w-28 rounded-lg bento-card p-1 text-[10px] z-50 flex flex-col gap-0.5 bg-[#08080a]">
              {[
                { code: "en", label: "English" },
                { code: "es", label: "Español" },
                { code: "zh", label: "中文" },
                { code: "jp", label: "日本語" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setLangDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer text-gray-400 hover:text-white transition-colors"
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-gray-400 hover:text-white"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Wallet Connection / Auth States */}
        {!isConnected ? (
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-white text-black font-display font-bold rounded-lg text-[10px] tracking-wider cursor-pointer hover:bg-neutral-200 transition-all active:scale-95 shadow-md shadow-white/5"
          >
            {t("connect")}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {!authenticated ? (
              <button
                onClick={loginWithWallet}
                disabled={authLoading}
                className="px-3 py-1.5 border border-brand-purple/40 hover:border-brand-purple text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-colors text-brand-purple hover:bg-brand-purple/5"
              >
                <Link2 size={12} />
                {authLoading ? t("authenticating") : t("signin")}
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-1 text-[10px] text-brand-green bg-brand-green/5 px-2 py-1.5 rounded-lg border border-brand-green/20">
                <ShieldCheck size={11} />
                <span>{t("authenticated")}</span>
              </div>
            )}

            <div className="bento-card px-3 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-3 bg-white/5">
              <span className="text-gray-400">{balance ? `${balance} ETH` : "-- ETH"}</span>
              <span className="h-3.5 w-px bg-white/10"></span>
              <span className="font-mono text-gray-300">{truncateAddress(address || "")}</span>
              <button
                onClick={handleDisconnect}
                className="p-0.5 rounded text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                title={t("disconnect")}
              >
                <LogOut size={11} />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
