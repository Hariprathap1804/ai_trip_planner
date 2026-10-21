import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { DemoDisclaimerBanner } from './components/layout/DemoDisclaimerBanner';
import { AIAssistantDrawer } from './components/ai-assistant/AIAssistantDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { useAuthStore } from './store/useAuthStore';
import { AppRouter } from './app/router';

function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#FBFBFD] text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <DemoDisclaimerBanner />
        <Header />
        <main className="flex-1">
          <AppRouter />
        </main>
        <Footer />
        <AIAssistantDrawer />
        <AuthModal />
      </div>
    </BrowserRouter>
  );
}

export default App;
