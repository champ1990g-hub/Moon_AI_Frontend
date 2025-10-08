import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

// Helper: Generate and manage a persistent unique User ID
const generateUserId = () => {
    const storedId = localStorage.getItem('chatUserId');
    if (storedId) return storedId;
    
    // Generate a new unique ID and save it to Local Storage
    const newId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('chatUserId', newId);
    return newId;
};

// Component Provider: Manage State and deliver context
export const ChatProvider = ({ children }) => {
    
    // Shared main State
    const [userId] = useState(generateUserId);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello, I am Moon AI. How can I help you today?", sender: "ai" } 
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const contextValue = { 
        userId, 
        messages, 
        setMessages,
        isLoading,
        setIsLoading,
        isDark,
        setIsDark,
    };
    
    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
};

// Custom Hook
export const useChat = () => {
    return useContext(ChatContext);
};