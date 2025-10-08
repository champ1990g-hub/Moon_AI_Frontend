import React from 'react';
import { useChat } from '../Context/ChatContext.jsx'; 

// Use Vite Environment Variable for the Backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://moon-ai-backend.onrender.com'; 

function Sidebar({ isSidebarOpen, setIsSidebarOpen }) { 
    const { userId, setMessages, isDark, setIsDark } = useChat(); 

    const handleNewChat = async () => {
        if (!window.confirm("Are you sure you want to start a new chat? This will clear the current history.")) return;
        
        try {
            // FIX: Added credentials: 'include' for CORS compatibility with Backend
            await fetch(`${BACKEND_URL}/api/chat/clear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId }),
                credentials: 'include' 
            });
            
            // Set initial AI message
            setMessages([{ 
                id: Date.now(), 
                text: "Hello, I am Moon AI. How can I help you today?", 
                sender: "ai" 
            }]);
            
            // Close Sidebar on mobile
            if (setIsSidebarOpen) { 
                setIsSidebarOpen(false); 
            }

        } catch (error) {
            console.error("Failed to clear chat history:", error);
            alert("Failed to clear history. Check console for details.");
        }
    };

    return (
        <div className={`sidebar ${isSidebarOpen ? 'sidebar-mobile-open' : ''}`}>
            {/* Close Sidebar Button (Mobile only) */}
            <button 
                className="sidebar-close-btn" 
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close Menu"
            >
                &times;
            </button>
            
            {/* New Chat Button */}
            <button className="new-chat-btn" onClick={handleNewChat}>
                + New Chat
            </button>

            <h4 className="sidebar-heading">Category</h4>
            <select className="category-select">
                <option value="">Choose category...</option>
                {/* Add more options if needed */}
            </select>
            
            {/* Recent Conversations Section (Mock Data) */}
            <h4 className="sidebar-heading">Recent Conversations</h4>
            <div className="chat-history-list">
                 <div className="history-item">
                    <p><strong>React Hooks Guide</strong></p>
                    <small className="history-date">Coding - Today</small>
                </div>
                <div className="history-item">
                    <p><strong>Cryptocurrency and Banking</strong></p>
                    <small className="history-date">Finance - Sep 5</small>
                </div>
                <div className="history-item">
                    <p><strong>History of Southeast Asia</strong></p>
                    <small className="history-date">History - Jul 10</small>
                </div>
            </div>

            {/* Dark Mode Switch */}
            <div className="dark-mode-container">
                <span>Dark Mode:</span>
                <label className="switch">
                    <input 
                        type="checkbox" 
                        checked={isDark} 
                        onChange={() => setIsDark(!isDark)} 
                    />
                    <span className="slider"></span>
                </label>
            </div>
        </div>
    );
}

export default Sidebar;