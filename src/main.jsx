import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store";
import {
  Web3AuthProvider,
  useWeb3Auth,
  useWeb3AuthConnect,
} from "@web3auth/modal-react-hooks";
import { configureChains, createConfig, WagmiConfig, publicProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import web3AuthContextConfig from "./auth/web3authContext";

import { BrowserRouter } from "react-router-dom";
import { Buffer } from "buffer";

if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

const queryClient = new QueryClient();

function Web3AuthDebugWrapper() {
  const { status } = useWeb3Auth();
  const { isConnected } = useWeb3AuthConnect();
  const [log, setLog] = useState([]);
  const renderedOnce = useRef(false);

  const addLog = (msg) => {
    console.log(msg);
    setLog((prev) => {
      // avoid duplicate spam
      if (prev[prev.length - 1] === msg) return prev;
      return [...prev, msg];
    });
  };

  useEffect(() => {
    addLog(`🌀 Web3Auth Status Changed: ${status}`);
    if (status === "ready") addLog("✅ Web3Auth is ready (UI loaded)");
    if (status === "connected") addLog("🎉 Wallet is connected successfully!");
    if (status === "error") addLog("❌ Web3Auth initialization failed");
  }, [status]);

  useEffect(() => {
    addLog(`🔗 Wallet connection state: ${isConnected}`);
  }, [isConnected]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status !== "connected" && status !== "ready") {
        addLog(
          "⚠️ Taking too long... possible devnet lag. Try TESTNET fallback."
        );
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (
      !renderedOnce.current &&
      (status === "ready" || status === "connected")
    ) {
      addLog("🚀 Rendering main app");
      renderedOnce.current = true;
    }
  }, [status]);

  if (status === "initializing" || status === "connecting") {
    return (
      <div className="text-white flex flex-col items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full mb-4"></div>
        <p>Loading Web3Auth...</p>
        <pre className="text-xs mt-6 bg-black/50 p-3 rounded border border-gray-600 max-w-md overflow-auto">
          {log.join("\n")}
        </pre>
      </div>
    );
  }

  if (status === "ready" || status === "connected") {
    return <App />;
  }

  return (
    <div className="text-red-500 text-center mt-10">
      Web3Auth failed to initialize. Check console logs for details.
    </div>
  );
}

const Root = () => (
  <Web3AuthProvider config={web3AuthContextConfig}>
    <QueryClientProvider client={queryClient}>
      {/* Wagmi configuration (replaces removed WagmiProvider from Web3Auth v5) */}
      <WagmiConfig
        config={(() => {
          const { chains, publicClient } = configureChains(
            [mainnet],
            [publicProvider()]
          );

          return createConfig({
            autoConnect: false,
            connectors: [
              web3AuthConnector({
                chains,
                options: {
                  clientId: web3AuthContextConfig.web3AuthOptions.clientId,
                  web3AuthNetwork:
                    web3AuthContextConfig.web3AuthOptions.web3AuthNetwork,
                },
              }),
            ],
            publicClient,
          });
        })()}
      >
        <Provider store={store}>
          <Web3AuthDebugWrapper />
        </Provider>
      </WagmiConfig>
    </QueryClientProvider>
  </Web3AuthProvider>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Root />
  </BrowserRouter>
);
