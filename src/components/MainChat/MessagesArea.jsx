import React, { useEffect, useRef, useState } from 'react';
import { Message } from './Message';
import { useAuth } from '../../context/AuthContext';

export const MessagesArea = ({ messages, userEvents }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [systemMessages, setSystemMessages] = useState([]);
  const [visibleSystemMessages, setVisibleSystemMessages] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, visibleSystemMessages]);

  useEffect(() => {
    if (!userEvents?.length) return;

    // Obtener el último evento
    const latestEvent = userEvents[userEvents.length - 1];
    
    // Crear nuevo mensaje del sistema
    const newSystemMessage = {
      id: latestEvent.id || `system-${Date.now()}`,
      timestamp: latestEvent.timestamp,
      content: latestEvent.type === 'connected' 
        ? `${latestEvent.username} se ha conectado`
        : `${latestEvent.username} se ha desconectado`
    };

    setVisibleSystemMessages(prev => [...prev, newSystemMessage]);

    // Eliminar el mensaje después de 5 segundos
    const timeoutId = setTimeout(() => {
      setVisibleSystemMessages(prev => 
        prev.filter(msg => msg.id !== newSystemMessage.id)
      );
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [userEvents]);

  return (
    <div className="messages-area">
      <div className="message-container">
        {messages.map((message) => (
          <Message
            key={message.id || message.timestamp?.toString()}
            text={message.message}
            imageUrl={message.imageUrl}
            isSent={message.senderId === user.uid}
            senderName={message.senderName}
          />
        ))}
        
        {visibleSystemMessages.map((sysMsg) => (
          <div key={sysMsg.id} className="system-message-container">
            <div className="system-message">
              {sysMsg.content}
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      <style jsx>{`
        .system-message-container {
          display: flex;
          justify-content: center;
          margin: 8px 0;
          animation: fadeIn 0.3s ease-in;
        }
        
        .system-message {
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.85rem;
          max-width: 80%;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};