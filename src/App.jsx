// gemini-chatbot/frontend/src/App.jsx

// 1. FIX: Must Import useState
import React, { useEffect, useState } from 'react'; 
import ChatMain from './components/ChatMain';
import Sidebar from './components/Sidebar';
import { useChat } from './Context/ChatContext.jsx'; 
import './App.css'; 
import brandLogo from './assets/Moon_AI_Logo.png';

function App() {
  const { isDark } = useChat();
  
  // 2. NEW: State for Mobile Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  // Logic Dark Mode on body tag: Adds or removes 'dark-mode' class to the body element.
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDark]);

  return (
    // Layout: Sidebar & Main Content
    <div className="app-container"> 
      {/* 3. FIX: Pass state to Sidebar as Props */}
      <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
      />
      
      <main className="main-content">
          <header className="main-header">
             
             <div className="header-left">
                {/* 4. NEW: Button to open/close Sidebar (Mobile only) */}
                <button 
                   className="menu-toggle-btn" 
                   onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                   aria-label="Toggle Menu" 
                >
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <line x1="3" y1="12" x2="21" y2="12"/>
                      <line x1="3" y1="18" x2="21" y2="18"/>
                   </svg>
                </button>
                
                <div className="header-logo">
                   <img src={brandLogo} alt="Moon AI Logo" className="brand-logo" />
                </div>
             </div>

             <div className="header-center">
                <nav className="header-nav">
                   <a href="#">Chat</a>
                   <a href="#">History</a>
                   <a href="#">Settings</a>
                </nav>
             </div>
             
             <div className="header-right">
                <button className="sign-up-btn">Sign Up</button>
             </div>
          </header>
          
          <ChatMain /> 
      </main>
    </div>
  );
}

export default App;