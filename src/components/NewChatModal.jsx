// gemini-chatbot/frontend/src/components/NewChatModal.jsx

import React, { useCallback, useEffect } from 'react';
import { useChat } from '../Context/ChatContext.jsx'; 

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://ai.hongfah.la'; 

function NewChatModal({ isVisible, onClose, setIsSidebarOpen }) {
    const { userId, setMessages } = useChat();

    // Close modal on Escape key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isVisible) {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isVisible, onClose]);

    // Logic to confirm and clear chat history
    const confirmNewChat = useCallback(async () => {
        onClose(); // Close the modal immediately
        
        try {
            // 1. API Call to clear history on backend
            const response = await fetch(`${BACKEND_URL}/api/chat/clear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId }),
                credentials: 'include' 
            });

            if (!response.ok) {
                throw new Error('Failed to clear chat history');
            }
            
            // 2. Set initial AI message
            setMessages([{ 
                id: Date.now(), 
                text: "ສະບາຍດີ, ຂ້ອຍເເມ່ນ Moon AI. ຍິນດີໃຫ້ການຊ່ວຍເຫລືອທ່ານ", 
                sender: "ai" 
            }]);
            
            // 3. Close Sidebar on mobile
            if (setIsSidebarOpen) { 
                setIsSidebarOpen(false); 
            }

        } catch (error) {
            console.error("Failed to clear chat history:", error);
            alert("ບໍ່ສາມາດລຶບປະຫວັດການສົນທະນາໄດ້. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ");
        }
    }, [userId, setMessages, setIsSidebarOpen, onClose]);

    if (!isVisible) return null;

    return (
        // Modal Overlay - Click outside to close
        <div 
            className="new-chat-modal-overlay" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Modal Content - Stop propagation to prevent closing when clicking inside */}
            <div 
                className="new-chat-modal-content" 
                onClick={(e) => e.stopPropagation()}
            >
                
                <h3 id="modal-title" className="modal-title">
                    ເລີ່ມການສົນທະນາໃໝ່?
                </h3>
                <p className="modal-message">
                    ທ່ານຢືນຢັນທີ່ຈະເລີ່ມການສົນທະນາໃໝ່ບໍ? ປະຫວັດການສົນທະນາປັດຈຸບັນຈະຖືກລຶບ.
                </p>

                <div className="modal-actions">
                    {/* Primary Action - Confirm */}
                    <button 
                        className="btn-confirm-new" 
                        onClick={confirmNewChat}
                        aria-label="Confirm new chat"
                    >
                        ຢືນຢັນ
                    </button>
                    {/* Secondary Action - Cancel */}
                    <button 
                        className="btn-cancel-new" 
                        onClick={onClose}
                        aria-label="Cancel"
                    >
                        ຍົກເລີກ
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NewChatModal;