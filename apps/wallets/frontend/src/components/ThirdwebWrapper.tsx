"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { useEffect, useState } from "react";
import { getClient } from "../app/client";

interface ThirdwebWrapperProps {
  children: React.ReactNode;
}

export function ThirdwebWrapper({ children }: ThirdwebWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [client, setClient] = useState<ReturnType<typeof getClient>>(null);

  useEffect(() => {
    const thirdwebClient = getClient();
    if (thirdwebClient) {
      setClient(thirdwebClient);
    }
    setMounted(true);
  }, []);

  // Always wrap in ThirdwebProvider so useActiveAccount() never throws.
  // Before mount: show loading spinner but keep provider context available.
  if (!mounted) {
    return (
      <ThirdwebProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Initializing Web3...</p>
          </div>
        </div>
      </ThirdwebProvider>
    );
  }

  if (!client) {
    return (
      <ThirdwebProvider>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-center">
          <p className="text-yellow-800 text-sm">
            ⚠️ Wallet functionality temporarily unavailable. Some features may be limited.
          </p>
        </div>
        {children}
      </ThirdwebProvider>
    );
  }

  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}