// gemini-chatbot/frontend/src/components/ChatMain.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../Context/ChatContext.jsx'; 
import ReactMarkdown from 'react-markdown'; 
import moonAILogo from '../assets/Moon_AI_Logo.png'; 

// FIX 2: Use Vite Environment Variable for the Backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'; 

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
                signal: controller.signal, // Pass the abort signal
            });
            
            if (!response.ok) {
                // Simplified error parsing (assuming text or json response)
                let errorMessage = 'An unknown server error occurred.';
                
                // Read the full error text from the response
                const errorText = await response.text(); 
                
                try {
                    // Try parsing as JSON first (for non-streaming errors)
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                } catch (e) {
                    // Fallback to plain text error
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
                
                // FIX 3: Explicitly check for the [STREAM_ERROR] tag sent by the backend
                const streamErrorMatch = chunk.match(/\[STREAM_ERROR\](.*)/);
                if (streamErrorMatch) {
                    const errorText = streamErrorMatch[1].trim();
                    aiResponseText += `\n\n[SERVER STREAM ERROR] ${errorText}`; 
                    // Update the message one last time with the error and break the loop
                    setMessages(prev => prev.map(msg => 
                        msg.id === aiMessageId ? { ...msg, text: aiResponseText, isError: true } : msg
                    ));
                    console.error("Server Stream Error:", errorText);
                    reader.cancel(); // Close the stream
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
                // Display error in the AI Bubble
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId ? { ...msg, text: finalErrorText, sender: 'ai' } : msg
                ));
            }
        } finally {
            setIsLoading(false);
            setAbortController(null); // Cleanup
        }
    };

    // ----------------------------------------------------
    // 3. Render
    // ----------------------------------------------------

    return (
        <div className="chat-main-area">
            
            {/* Message List */}
            <div className="message-list">
                {messages.map(msg => (
                    <div 
                        key={msg.id} 
                        className={`message-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-ai'}`}
                    >
                        {/* AI Avatar (AI side only) */}
                        {msg.sender === 'ai' && ( 
                            <div className="ai-avatar">
                                <img src={moonAILogo} alt="Moon AI Avatar" /> 
                            </div>
                        )}
                        <div className="message-content">
                            {/* Use ReactMarkdown for AI messages */}
                            {msg.sender === 'ai' ? (
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            ) : (
                                msg.text
                            )}
                        </div>
                    </div>
                ))}
                
                {/* Loading Indicator (Shown when input is not empty and loading) */}
                {isLoading && input.trim() !== '' && (
                    <div className="loading-indicator">AI is typing...</div>
                )}
                <div ref={messagesEndRef} /> 
            </div>

            {/* Input Form: Sticky at the bottom */}
            <form onSubmit={sendMessage} className="chat-input-form">
                <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder={isLoading ? "Please wait or click 'Stop'..." : "Type your message here..."}
                    disabled={isLoading && !abortController} 
                />
                
                {/* Single Button: Acts as Submit or Abort */}
                <button 
                    type={isLoading ? 'button' : 'submit'} // Use type='button' to prevent form submission while loading
                    onClick={isLoading ? stopGeneration : undefined} // Call stopGeneration when loading
                    disabled={!isLoading && !input.trim()} // If not loading, disable when input is empty
                    className={isLoading ? 'stop-active' : ''} // Change class to apply Stop style
                >
                    {isLoading ? 'Stop' : 'Send'} {/* Change text */}
                </button>
            </form>
        </div>
    );
}

export default ChatMain;