// gemini-chatbot/frontend/src/components/Sidebar.jsx

import React from 'react';
import { useChat } from '../Context/ChatContext.jsx'; 

const BACKEND_URL = 'http://localhost:3000'; 

// FIX: Receive Props isSidebarOpen and setIsSidebarOpen
function Sidebar({ isSidebarOpen, setIsSidebarOpen }) { 
    const { userId, setMessages, isDark, setIsDark } = useChat(); 

    const handleNewChat = async () => {
        if (!window.confirm("Are you sure you want to start a new chat? This will clear the current history.")) return;
        
        try {
            await fetch(`${BACKEND_URL}/api/chat/clear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId })
            });
            
            // Initial AI Message
            setMessages([{ 
                id: Date.now(), 
                text: "Hello, I am Moon AI. How can I help you today?", 
                sender: "ai" 
            }]);
            
            // Close Sidebar when starting new chat (for Mobile UX)
            if (setIsSidebarOpen) { 
                setIsSidebarOpen(false); 
            }

        } catch (error) {
            console.error("Failed to clear chat session:", error);
            alert("Error: Could not clear chat history on the server.");
        }
    };

    return (
        // FIX: Correct syntax - use () instead of {} in return
        <div className={`sidebar ${isSidebarOpen ? 'sidebar-mobile-open' : ''}`}> 
            
            {/* FIX: Add Close Sidebar button for Mobile */}
            <button 
                className="sidebar-close-btn"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close Sidebar"
            >
                ✕
            </button>

            <button 
                onClick={handleNewChat}
                className="new-chat-btn"
            >
                + New chat
            </button>

            {/* Category Section (Mock) */}
            <h4 className="sidebar-heading">Category</h4>
            <select className="category-select">
                <option>Choose category...</option>
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