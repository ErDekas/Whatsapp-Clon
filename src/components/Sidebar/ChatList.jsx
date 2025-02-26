import React, { useState, useEffect } from 'react';
import { ChatListItem } from './ChatListItem';
import axios from 'axios';
import io from 'socket.io-client';

export const ChatList = ({ currentUserId }) => {
  const [usersWithDetails, setUsersWithDetails] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [socket, setSocket] = useState(null);

  // Inicializar Socket.IO
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    // Limpiar la conexión de socket cuando el componente se desmonte
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Cargar avatares del servidor
  useEffect(() => {
    const fetchAvatars = async () => {
      setLoadingAvatars(true);
      try {
        const response = await axios.get('./avatars');
        
        // Formatea los datos para que coincidan con la estructura esperada
        const formattedAvatars = response.data.map((avatar, index) => ({
          id: index + 1,
          url: `./avatares/${avatar}`,
          alt: `Avatar ${index + 1}`
        }));
        
        setAvatars(formattedAvatars);
      } catch (error) {
        console.error('Error al cargar avatares:', error);
        // Si hay un error, usar algunos avatares predeterminados como fallback
        setAvatars([
          { id: 1, url: './avatares/avatar1.jpg', alt: 'Avatar 1' },
          { id: 2, url: './avatares/avatar2.jpg', alt: 'Avatar 2' },
          { id: 3, url: './avatares/avatar3.jpg', alt: 'Avatar 3' },
        ]);
      } finally {
        setLoadingAvatars(false);
      }
    };

    fetchAvatars();
  }, []);

  // Configurar listeners de Socket.IO para usuarios en línea
  useEffect(() => {
    if (!socket) return;
    
    // Notificar al servidor sobre mi conexión (incluyendo mi ID)
    if (currentUserId) {
      socket.emit('joinChat', {
        userId: currentUserId,
        username: user?.displayName || localStorage.getItem('username') || 'Usuario',
        photoURL: user?.photoURL || null,
        status: user?.status || 'Disponible'
      });
    }
    
    // Escuchar lista de usuarios en línea
    socket.on('usersOnline', (users) => {
      console.log('Usuarios en línea recibidos:', users);
      
      // Filtrar al usuario actual directamente aquí
      const filteredUsers = currentUserId 
        ? users.filter(user => user.userId !== currentUserId)
        : users;
        
      setOnlineUsers(filteredUsers);
    });
    
    // Escuchar cuando un usuario comienza/deja de escribir
    socket.on('userTyping', (typingData) => {
      console.log('Usuario escribiendo:', typingData);
      setTypingUsers(prev => ({
        ...prev,
        [typingData.userId]: {
          ...typingData
        }
      }));
    });

    // Limpiar listeners cuando el componente se desmonte o el socket cambie
    return () => {
      socket.off('usersOnline');
      socket.off('userTyping');
    };
  }, [socket, currentUserId]);

  // Procesar usuarios en línea cuando cambian
  useEffect(() => {
    // Asegurarse de que onlineUsers es un array antes de procesar
    if (!Array.isArray(onlineUsers)) {
      console.warn('onlineUsers no es un array:', onlineUsers);
      setUsersWithDetails([]);
      return;
    }
    
    // Procesar usuarios para asignar avatar si no tienen uno
    const processedUsers = onlineUsers.map(user => {
      // Si el usuario no tiene un avatar asignado y hay avatares disponibles
      if (!user.photoURL && avatars.length > 0) {
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        return {
          ...user,
          photoURL: randomAvatar.url,
          status: typingUsers[user.userId]?.isTyping ? 'typing' : 'online'
        };
      }
      
      return {
        ...user,
        status: typingUsers[user.userId]?.isTyping ? 'typing' : 'online'
      };
    });
    
    setUsersWithDetails(processedUsers);
  }, [onlineUsers, typingUsers, avatars]);

  return (
    <div className="chat-list">
      <h3 className="chat-list-title">Usuarios en línea ({usersWithDetails.length})</h3>
      {loadingAvatars ? (
        <p className="loading-message">Cargando usuarios...</p>
      ) : usersWithDetails.length === 0 ? (
        <p className="no-users-message">No hay otros usuarios conectados</p>
      ) : (
        usersWithDetails.map(user => {
          return (
            <ChatListItem 
              key={user.userId || `user-${Math.random()}`}
              user={user.username || user.displayName || 'Usuario'} 
              avatar={user.photoURL}
              // Aquí se elimina el tiempo y se pasa directamente el estado
              lastMessage={user.status === 'typing' ? "Escribiendo..." : "En línea"} 
            />
          );
        })
      )}
    </div>
  );
};