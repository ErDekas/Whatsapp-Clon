import React, { useEffect, useRef, useState } from 'react';
import { Message } from './Message';
import { useAuth } from '../../context/AuthContext'; // Ajusta la ruta según tu estructura

export const MessagesArea = ({ messages, userEvents }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [visibleSystemMessages, setVisibleSystemMessages] = useState([]);
  const timeoutsRef = useRef(new Map()); // Mapa para manejar timeouts de los mensajes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, visibleSystemMessages]);

  useEffect(() => {
    if (!userEvents?.length) return;

    const latestEvent = userEvents[userEvents.length - 1];

    const newSystemMessage = {
      id: latestEvent.id || `system-${Date.now()}`,
      timestamp: latestEvent.timestamp,
      content: latestEvent.type === 'connected' 
        ? `${latestEvent.username} se ha conectado`
        : `${latestEvent.username} se ha desconectado`
    };

    // Eliminar mensajes previos si aún están en pantalla
    if (visibleSystemMessages.length > 0) {
      visibleSystemMessages.forEach((msg) => {
        if (timeoutsRef.current.has(msg.id)) {
          clearTimeout(timeoutsRef.current.get(msg.id));
          timeoutsRef.current.delete(msg.id);
        }
      });

      setVisibleSystemMessages([]); // Limpiamos todos los mensajes previos antes de añadir uno nuevo
    }

    setVisibleSystemMessages([newSystemMessage]); // Solo dejamos el mensaje actual

    // Configurar timeout para eliminar el mensaje después de 5s
    const timeoutId = setTimeout(() => {
      setVisibleSystemMessages((prev) => prev.filter(msg => msg.id !== newSystemMessage.id));
      timeoutsRef.current.delete(newSystemMessage.id);
    }, 5000);

    timeoutsRef.current.set(newSystemMessage.id, timeoutId);

    return () => {
      // Limpiar todos los timeouts al desmontar o cuando userEvents cambie
      timeoutsRef.current.forEach((timeout, id) => {
        clearTimeout(timeout);
        timeoutsRef.current.delete(id);
      });
    };
  }, [userEvents]);

  return (
    <div className="messages-area">
      <div className="message-container">
        {messages.map((message) => (
          <Message
            key={message.id || message.timestamp?.toString()}
            text={message.message}
            file={message.file}
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
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          background-color: #f7f7f7;
        }
        
        .message-container {
          display: flex;
          flex-direction: column;
        }
        
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