import React, { useEffect } from 'react';
import { VideoIcon, Phone, Search, MoreVertical } from 'lucide-react';

export const ChatHeader = ({ onlineUsers, typingUsers = {} }) => {
  // Depuración para ver lo que está llegando
  useEffect(() => {
    console.log("ChatHeader recibió typingUsers:", typingUsers);
  }, [typingUsers]);

  // Función para obtener los nombres de los usuarios que están escribiendo
  const getTypingUsersNames = () => {
    // Verificar que typingUsers sea un objeto y no esté vacío
    if (!typingUsers || typeof typingUsers !== 'object' || Object.keys(typingUsers).length === 0) {
      return null;
    }
    
    console.log("Procesando typingUsers en getTypingUsersNames:", typingUsers);
    
    // Extraer usuarios que están escribiendo actualmente junto con sus nombres
    const typingUserData = Object.entries(typingUsers)
      .filter(([_, userData]) => userData && userData.isTyping)
      .map(([_, userData]) => userData.username);
    
    console.log("Usuarios que están escribiendo:", typingUserData);
    
    if (typingUserData.length === 0) return null;
    
    // Formatear el mensaje según la cantidad de usuarios escribiendo
    if (typingUserData.length === 1) {
      return `${typingUserData[0]} está escribiendo...`;
    } else if (typingUserData.length === 2) {
      return `${typingUserData[0]} y ${typingUserData[1]} están escribiendo...`;
    } else {
      return "Varios usuarios están escribiendo...";
    }
  };

  const typingMessage = getTypingUsersNames();
  const onlineCount = onlineUsers?.length || 0;

  // Depuración del mensaje final
  useEffect(() => {
    console.log("Mensaje de typing calculado:", typingMessage);
  }, [typingMessage]);

  return (
    <div className="chat-header">
      <div className="contact-info">
        <div className="avatar"></div>
        <div className="contact-details">
          <div className="contact-name">Chat Grupal</div>
          {typingMessage ? (
            <div className="typing-status">{typingMessage}</div>
          ) : (
            <div className="online-status">{onlineCount} usuario{onlineCount !== 1 ? 's' : ''} en línea</div>
          )}
        </div>
      </div>
      <div className="header-icons">
        <VideoIcon className="icon" />
        <Phone className="icon" />
        <Search className="icon" />
        <MoreVertical className="icon" />
      </div>
    </div>
  );
};