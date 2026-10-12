import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { DemoDisclaimerBanner } from './components/layout/DemoDisclaimerBanner';
import { AIAssistantDrawer } from './components/ai-assistant/AIAssistantDrawer';
import { AppRouter } from './app/router';

function App() {
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
      </div>
    </BrowserRouter>
  );
}

export default App;
