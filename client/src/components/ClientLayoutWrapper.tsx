"use client";

import React, { useState, useEffect } from "react";
import { Web3Provider } from "../context/Web3Context";
import { AuthProvider } from "../context/AuthContext";
import { Navbar } from "./Navbar";

export const ClientLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("en");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  // Sync theme with body class
  useEffect(() => {
    const body = document.body;
    if (theme === "light") {
      body.classList.add("light-theme");
    } else {
      body.classList.remove("light-theme");
    }
  }, [theme]);

  return (
    <Web3Provider>
      <AuthProvider>
        <div className={`min-h-screen flex flex-col transition-colors duration-300 relative z-10 ${theme}`}>
          {/* Header */}
          <Navbar 
            theme={theme} 
            toggleTheme={toggleTheme} 
            language={language} 
            setLanguage={setLanguage} 
          />
          
          {/* Content */}
          <main className="flex-grow flex flex-col relative">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="glass border-t border-white/5 py-8 text-center text-xs text-gray-500 relative z-10">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-display font-bold tracking-wider">ASTRAEA LABS © 2026</span>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-brand-purple transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-brand-purple transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-brand-purple transition-colors">IPFS Gateway</a>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Web3Provider>
  );
};
