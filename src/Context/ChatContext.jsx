import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

// Component Provider: Manage State and deliver context
export const ChatProvider = ({ children }) => {
    
    // NEW: Define the helper function INSIDE the component or use it as a local function.
    // For lazy initialization (called once), we will define the logic inline inside useState.
    const [userId] = useState(() => {
        const storedId = localStorage.getItem('chatUserId');
        if (storedId) return storedId;
        
        // Generate a new unique ID and save it to Local Storage
        const newId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('chatUserId', newId);
        return newId;
    });

    const [messages, setMessages] = useState([
        { id: 1, text: "ສະບາຍດີ,ຂ້ອຍເເມ່ນ Moon AI. ຍິນດີໃຫ້ການຊ່ວຍເຫລືອທ່ານ", sender: "ai" } 
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
// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => {
    return useContext(ChatContext);
};