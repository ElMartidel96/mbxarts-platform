"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "./ErrorBoundary";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AmplitudeProvider } from "./monitoring/AmplitudeProvider";
import { NotificationProvider } from "./ui/NotificationSystem";

// KILL-SWITCH: Dynamic import with SSR disabled for StaticBackground
const StaticBackground = dynamic(() => import("./ui/StaticBackground").then(mod => ({ default: mod.StaticBackground })), {
  ssr: false,
  loading: () => null
});

// Dynamic import ThirdwebWrapper - MUST be ssr:false to prevent EMFILE/ESM errors
// thirdweb's dependency chain (viem→ox→@noble/hashes) cannot resolve in Vercel's
// serverless ESM environment. Client-only loading avoids all server-side module issues.
const ThirdwebWrapper = dynamic(() => import("./ThirdwebWrapper").then(mod => ({ default: mod.ThirdwebWrapper })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  )
});

const Navbar = dynamic(() => import("./Navbar").then(mod => ({ default: mod.Navbar })), {
  ssr: false,
  loading: () => <div className="h-16 bg-background shadow-lg" />
});

const Footer = dynamic(() => import("./Footer").then(mod => ({ default: mod.Footer })), {
  ssr: false,
  loading: () => <div className="h-32 bg-background" />
});

const MintDebugger = dynamic(() => import("./MintDebugger").then(mod => ({ default: mod.MintDebugger })), {
  ssr: false,
  loading: () => null
});

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  console.log('🔍 ClientLayout: Rendering with children:', !!children);
  console.log('🔍 ClientLayout: About to render ThirdwebWrapper (now static import)');
  
  return (
    <ThemeProvider>
      <ThirdwebWrapper>
        <AmplitudeProvider>
          <NotificationProvider>
            <ErrorBoundary>
            {/* FONDO ESTÁTICO - CON KILL-SWITCH */}
            {process.env.NEXT_PUBLIC_DISABLE_BG !== '1' && <StaticBackground />}
            
            {/* ESTRUCTURA PRINCIPAL */}
            <div className="relative min-h-screen flex flex-col">
              {/* NAVBAR ORIGINAL CON THEME TOGGLE */}
              <Navbar />
              
              {/* CONTENIDO PRINCIPAL */}
              <main className="flex-1 relative z-0">
                {children}
              </main>
              
              {/* FOOTER */}
              <Footer />
              <MintDebugger />
            </div>
            </ErrorBoundary>
          </NotificationProvider>
        </AmplitudeProvider>
      </ThirdwebWrapper>
    </ThemeProvider>
  );
}