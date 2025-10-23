// gemini-chatbot/frontend/src/App.jsx

import React, { useEffect, useState, useCallback } from 'react';
import ChatMain from './components/ChatMain';
import Sidebar from './components/Sidebar';
import { useChat } from './Context/ChatContext.jsx';
import './App.css';
import brandLogo from './assets/Moon_AI_Logo.png';

function App() {
    const { isDark } = useChat();
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    // Function to display the Popup for 3 seconds
    const handleUnderDevelopmentClick = useCallback((e) => {
        if (e) {
            e.preventDefault();
        }
        
        // Show popup
        setShowPopup(true);

        // Set timeout to hide popup after 3 seconds
        // FIX: Renamed 'timer' to '_timer' to satisfy the unused variable linter rule.
        const _timer = setTimeout(() => {
            setShowPopup(false);
        }, 3000);
        
        // We don't return anything here as it's an event handler.
    }, []); // Dependency array is empty and correct

    // Dark Mode Logic - Apply to body element
    useEffect(() => {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDark]);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isSidebarOpen && window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar && !sidebar.contains(e.target) && !e.target.closest('.menu-toggle-btn')) {
                    setIsSidebarOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    return (
        <div className="app-container">
            
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                handleUnderDevelopmentClick={handleUnderDevelopmentClick}
            />
            
            <main className="main-content">
                <header className="main-header">
                    
                    <div className="header-left">
                        {/* Menu Toggle Button (Mobile only) */}
                        <button
                            className="menu-toggle-btn"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            aria-label="Toggle Menu"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <line x1="3" y1="12" x2="21" y2="12"/>
                                <line x1="3" y1="18" x2="21" y2="18"/>
                            </svg>
                        </button>
                        
                        {/* Brand Logo */}
                        <div className="header-logo">
                            <img
                                src={brandLogo}
                                alt="Moon AI Logo"
                                className="brand-logo"
                            />
                        </div>
                    </div>

                    {/* Navigation (Desktop only) */}
                    <div className="header-center">
                        <nav className="header-nav">
                            <a
                                href="#"
                                onClick={handleUnderDevelopmentClick}
                            >
                                Chat
                            </a>
                            <a
                                href="#"
                                onClick={handleUnderDevelopmentClick}
                            >
                                History
                            </a>
                            <a
                                href="#"
                                onClick={handleUnderDevelopmentClick}
                            >
                                Setting
                            </a>
                        </nav>
                    </div>
                    
                    {/* Sign Up Button (Desktop only) */}
                    <div className="header-right">
                        <button
                            className="sign-up-btn"
                            onClick={handleUnderDevelopmentClick}
                        >
                            Sign Up
                        </button>
                    </div>
                </header>
                
                {/* Main Chat Area */}
                <ChatMain />
            </main>

            {/* Under Development Popup with Icon */}
            <div className={`under-development-popup ${showPopup ? 'show' : ''}`}>
                {/* Settings Cog Icon */}
                <svg
                    className="popup-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <p>ຍັງຢູ່ໃນຂັ້ນຕອນການພັດທະນາ ຂໍອະໄພໃນຄວາມບໍ່ສະດວກ</p>
            </div>
        </div>
    );
}

export default App;