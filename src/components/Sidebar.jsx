// gemini-chatbot/frontend/src/components/Sidebar.jsx

import React, { useState, useCallback } from 'react';
import { useChat } from '../Context/ChatContext.jsx'; 
import NewChatModal from './NewChatModal.jsx';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://ai.hongfah.la'; 

function Sidebar({ isSidebarOpen, setIsSidebarOpen, handleUnderDevelopmentClick }) { 
    const { isDark, setIsDark } = useChat(); 

    // State to control modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Function to open the modal
    const openNewChatModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    // Function to close the modal
    const closeNewChatModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    // Function to close sidebar (useful for mobile)
    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
    }, [setIsSidebarOpen]);

    // Handle category change
    const handleCategoryChange = useCallback((e) => {
        if (e.target.value) {
            handleUnderDevelopmentClick();
        }
    }, [handleUnderDevelopmentClick]);

    return (
        <>
            <div className={`sidebar ${isSidebarOpen ? 'sidebar-mobile-open' : ''}`}>
                {/* Close Sidebar Button (Mobile only) */}
                <button 
                    className="sidebar-close-btn" 
                    onClick={closeSidebar}
                    aria-label="Close Menu"
                >
                    &times;
                </button>
                
                {/* New Chat Button */}
                <button 
                    className="new-chat-btn" 
                    onClick={openNewChatModal}
                    aria-label="Start New Chat"
                >
                    <span style={{ fontSize: '18px', marginRight: '5px' }}>+</span>
                    ສົນທະນາໃໝ່
                </button>
                
                {/* Category Select */}
                <h4 className="sidebar-heading">ໝວດໝູ່</h4>
                <select 
                    className="category-select" 
                    onChange={handleCategoryChange}
                    defaultValue=""
                >
                    <option value="">ເລືອກໝວດໝູ່...</option>
                    <option value="coding">ການເຂົ້າລະຫັດ</option>
                    <option value="finance">ການເງິນ</option>
                    <option value="education">ການສຶກສາ</option>
                    <option value="health">ສຸຂະພາບ</option>
                    <option value="general">ທົ່ວໄປ</option>
                </select>
                
                {/* Recent Conversations */}
                <h4 className="sidebar-heading">ການສົນທະນາລ່າສຸດ</h4>
                <div className="chat-history-list">
                    <div 
                        className="history-item" 
                        onClick={handleUnderDevelopmentClick}
                        role="button"
                        tabIndex={0}
                    >
                        <p><strong>React Hooks Guide</strong></p>
                        <small className="history-date">Coding - ມື້ນີ້</small>
                    </div>
                    <div 
                        className="history-item" 
                        onClick={handleUnderDevelopmentClick}
                        role="button"
                        tabIndex={0}
                    >
                        <p><strong>Cryptocurrency and Banking</strong></p>
                        <small className="history-date">Finance - Sep 5</small>
                    </div>
                    <div 
                        className="history-item" 
                        onClick={handleUnderDevelopmentClick}
                        role="button"
                        tabIndex={0}
                    >
                        <p><strong>History of Southeast Asia</strong></p>
                        <small className="history-date">History - Jul 10</small>
                    </div>
                </div>

                {/* Dark Mode Switch */}
                <div className="dark-mode-container">
                    <span>Darkmode</span>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={isDark} 
                            onChange={() => setIsDark(!isDark)}
                            aria-label="Toggle Dark Mode"
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
            
            {/* Modal Component */}
            <NewChatModal 
                isVisible={isModalOpen} 
                onClose={closeNewChatModal} 
                setIsSidebarOpen={setIsSidebarOpen}
            />
        </>
    );
}

export default Sidebar;