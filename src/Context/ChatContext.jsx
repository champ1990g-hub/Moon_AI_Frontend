// gemini-chatbot/frontend/src/context/ChatContext.jsx

import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

// ----------------------------------------------------
// 1. Helper: สร้างและจัดการ User ID (จำเป็นสำหรับ Backend Session)
// ----------------------------------------------------
const generateUserId = () => {
    const storedId = localStorage.getItem('chatUserId');
    if (storedId) return storedId;
    
    // สร้าง ID ใหม่ที่ไม่ซ้ำกัน และบันทึกไว้ใน Local Storage
    const newId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('chatUserId', newId);
    return newId;
};

// ----------------------------------------------------
// 2. Component Provider: จัดการ State และส่งข้อมูล
// ----------------------------------------------------
export const ChatProvider = ({ children }) => {
    
    // State หลักที่ใช้ร่วมกัน
    const [userId] = useState(generateUserId);
    const [messages, setMessages] = useState([
        { id: 1, text: "ສະບາຍດີ ຂ້ອຍຊື່ Moon AI. ຍິນດີໃຫ້ການຊ່ວຍເຫລືອທ່ານ.", sender: "ai" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDark, setIsDark] = useState(false); // สำหรับ Dark Mode

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

// ----------------------------------------------------
// 3. Custom Hook: เพื่อให้ Component อื่นเรียกใช้งานง่าย
// ----------------------------------------------------
export const useChat = () => useContext(ChatContext);