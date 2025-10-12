// gemini-chatbot/frontend/src/components/ChatMain.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../Context/ChatContext.jsx'; 
import ReactMarkdown from 'react-markdown'; 
import moonAILogo from '../assets/Moon_AI_Logo.png'; 

// FIX 1: Update the fallback URL to the deployed Render URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://moon-ai-backend.onrender.com'; 

function ChatMain() {
    const { 
        userId, 
        messages, 
        setMessages, 
        isLoading, 
        setIsLoading 
    } = useChat(); 

    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null); 
    const [abortController, setAbortController] = useState(null); 

    // ----------------------------------------------------
    // 1. Utility Functions
    // ----------------------------------------------------

    // Auto-scroll to the latest message
    useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100); 
        return () => clearTimeout(timer);
    }, [messages]);

    // Function to abort the current streaming request
    const stopGeneration = useCallback(() => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setIsLoading(false);
            console.log('Request aborted by user.');
        }
    }, [abortController, setIsLoading]);

    // ----------------------------------------------------
    // 2. Main Send Message Logic (Handles Streaming and Abort)
    // ----------------------------------------------------

    const sendMessage = async (e) => {
        e.preventDefault();
        
        // If loading, call Stop instead of sending
        if (isLoading) {
            stopGeneration();
            return;
        }
        
        const textInput = input.trim(); 
        if (!textInput) return;
        
        // Setup new Abort Controller
        const controller = new AbortController();
        setAbortController(controller); 
        
        const userMessage = { id: Date.now(), text: textInput, sender: 'user' };
        
        // 1. Display user message immediately
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiMessageId = Date.now() + 1;
        let aiResponseText = '';

        // 2. Display empty AI bubble for streaming content
        setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai' }]);
        
        try {
            const response = await fetch(`${BACKEND_URL}/api/chat/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: userId, 
                    message: textInput, 
                }),
                signal: controller.signal, 
                // FIX 2: Add credentials for CORS compatibility
                credentials: 'include', 
            });
            
            if (!response.ok) {
                let errorMessage = 'An unknown server error occurred.';
                
                const errorText = await response.text(); 
                
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                } catch {
                    errorMessage = errorText.trim() || errorMessage;
                }
                
                throw new Error(errorMessage);
            }
            
            // 3. Read response using streaming API
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                
                const streamErrorMatch = chunk.match(/\[STREAM_ERROR\](.*)/);
                if (streamErrorMatch) {
                    const errorText = streamErrorMatch[1].trim();
                    aiResponseText += `\n\n[SERVER STREAM ERROR] ${errorText}`; 
                    setMessages(prev => prev.map(msg => 
                        msg.id === aiMessageId ? { ...msg, text: aiResponseText, isError: true } : msg
                    ));
                    console.error("Server Stream Error:", errorText);
                    reader.cancel(); 
                    break; 
                }

                aiResponseText += chunk;
                
                // Update AI Bubble content
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId ? { ...msg, text: aiResponseText } : msg
                ));
            }
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Failed to send message:", error.message);
                const finalErrorText = `[ERROR] ${error.message}`;
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId ? { ...msg, text: finalErrorText, sender: 'ai' } : msg
                ));
            }
        } finally {
            setIsLoading(false);
            setAbortController(null); 
        }
    };

    // ----------------------------------------------------
    // 3. Render
    // ----------------------------------------------------

    const renderMessage = (msg) => (
        <div 
            key={msg.id} 
            className={`message-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-ai'}`}
        >
            {msg.sender === 'ai' && ( 
                <div className="ai-avatar">
                    <img src={moonAILogo} alt="Moon AI Avatar" /> 
                </div>
            )}
            <div className="message-content">
                {msg.sender === 'ai' ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                    msg.text
                )}
            </div>
        </div>
    );

    return (
        <div className="chat-main-area">
            
            {/* Message List */}
            <div className="message-list">
                {messages.map(renderMessage)}
                
                {/* Loading Indicator */}
                {isLoading && input.trim() !== '' && (
                    <div className="loading-indicator">AI is typing...</div>
                )}
                <div ref={messagesEndRef} /> 
            </div>

            {/* Input Form */}
            <form onSubmit={sendMessage} className="chat-input-form">
                <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder={isLoading ? "Please wait or click 'Stop'..." : "Type your message here..."}
                    disabled={isLoading && !abortController} 
                />
                
                {/* Single Button: Submit or Abort */}
                <button 
                    type={isLoading ? 'button' : 'submit'} 
                    onClick={isLoading ? stopGeneration : undefined} 
                    disabled={!isLoading && !input.trim()} 
                    className={isLoading ? 'stop-active' : ''} 
                >
                    {isLoading ? 'Stop' : 'Send'} 
                </button>
            </form>
        </div>
    );
}

export default ChatMain;