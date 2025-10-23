// gemini-chatbot/frontend/src/components/ChatMain.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../Context/ChatContext.jsx';
import ReactMarkdown from 'react-markdown';
import moonAILogo from '../assets/Moon_AI_Logo.png';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://ai.hongfah.la';

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
    const messageListRef = useRef(null);

    // ----------------------------------------------------
    // 1. Utility Functions
    // ----------------------------------------------------

    // Optimized auto-scroll to the latest message (Already used useCallback)
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 100);
        return () => clearTimeout(timer);
    }, [messages, scrollToBottom]);

    // Function to abort the current streaming request (Already used useCallback)
    const stopGeneration = useCallback(() => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setIsLoading(false);
            console.log('Request aborted by user.');
        }
    }, [abortController, setIsLoading]); // Dependencies are correct

    // ----------------------------------------------------
    // 2. Main Send Message Logic (Wrapped in useCallback)
    // ----------------------------------------------------
    
    // **FIXED:** Wrapping sendMessage in useCallback to stabilize it as a dependency for handleKeyDown.
    const sendMessage = useCallback(async (e) => {
        // e.preventDefault() is moved outside the useCallback since it's the first thing in the handler
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }
        
        // Use local state variables (input, isLoading) via their setters/latest values
        // to avoid including them in the dependency array.
        
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
        setInput(''); // Use setInput to clear the input field
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
                credentials: 'include', 
            });
            
            if (!response.ok) {
                let errorMessage = 'An unknown server error occurred.';
                
                try {
                    const errorText = await response.text(); 
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                } catch {
                    errorMessage = response.statusText || errorMessage;
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
                
                // Check for stream errors
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
                const finalErrorText = `❌ ເກີດຂໍ້ຜິດພາດ: ${error.message}`;
                setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId ? { ...msg, text: finalErrorText, sender: 'ai' } : msg
                ));
            } else {
                // If aborted, update message to show it was stopped
                setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId && !msg.text ?
                    { ...msg, text: 'ການສົ່ງຂໍ້ຄວາມຖືກຍົກເລີກ' } : msg
                ));
            }
        } finally {
            setIsLoading(false);
            setAbortController(null);
        }
    }, [userId, input, isLoading, stopGeneration, setMessages, setInput, setIsLoading, setAbortController]);

    // Handle Enter key to send message (Dependency 'sendMessage' is now stable)
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    }, [sendMessage]); // Now sendMessage is a stable dependency!

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
            <div className={`message-content ${msg.isError ? 'message-error' : ''}`}>
                {msg.sender === 'ai' ? (
                    <ReactMarkdown>{msg.text || '...'}</ReactMarkdown>
                ) : (
                    msg.text
                )}
            </div>
        </div>
    );

    return (
        <div className="chat-main-area">
            
            {/* Message List */}
            <div className="message-list" ref={messageListRef}>
                {messages.map(renderMessage)}
                
                {/* Loading Indicator */}
                {isLoading && (
                    <div className="loading-indicator">
                        <span>AI ກຳລັງພິມ</span>
                        <span className="loading-dots">
                            <span>.</span>
                            <span>.</span>
                            <span>.</span>
                        </span>
                    </div>
                )}
                <div ref={messagesEndRef} /> 
            </div>

            {/* Input Form */}
            <form onSubmit={sendMessage} className="chat-input-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isLoading ? "ກະລຸນາລໍຖ້າ ຫຼື ກົດ 'Stop'..." : "ພິມຂໍ້ຄວາມທີ່ນີ້..."}
                    disabled={isLoading && !abortController}
                    maxLength={2000}
                    autoComplete="off"
                />
                
                {/* Single Button: Submit or Abort */}
                <button
                    type={isLoading ? 'button' : 'submit'}
                    onClick={isLoading ? stopGeneration : undefined}
                    disabled={!isLoading && !input.trim()}
                    className={isLoading ? 'stop-active' : ''}
                    aria-label={isLoading ? 'Stop generation' : 'Send message'}
                >
                    {isLoading ? 'Stop' : 'Send'}
                </button>
            </form>
        </div>
    );
}

export default ChatMain;