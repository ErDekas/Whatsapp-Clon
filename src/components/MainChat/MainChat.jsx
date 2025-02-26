import React, { useState, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessagesArea } from './MessagesArea';
import { MessageInput } from './MessageInput';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';

export const MainChat = () => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [userEvents, setUserEvents] = useState([]);
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
    });

    return () => {
      unsubscribe();
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('joinChat', {
      userId: user.uid,
      username: user.displayName || 'Usuario'
    });

    socket.on('previousMessages', (previousMessages) => {
      setMessages(previousMessages);
    });

    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('usersOnline', (users) => {
      setOnlineUsers(users);
    });
    
    socket.on('userConnected', (data) => {
      if (data.userId !== user.uid) {
        const newEvent = {
          type: 'connected',
          userId: data.userId,
          username: data.username,
          timestamp: Date.now(),
          id: `connect-${Date.now()}`
        };
        setUserEvents(prev => [...prev, newEvent]);
      }
    });
    
    socket.on('userDisconnected', (data) => {
      const newEvent = {
        type: 'disconnected',
        userId: data.userId,
        username: data.username || 'Un usuario',
        timestamp: Date.now(),
        id: `disconnect-${Date.now()}`
      };
      setUserEvents(prev => [...prev, newEvent]);
    });

    socket.on('userTyping', (data) => {
      console.log("Recibido evento userTyping:", data); // Depuración
      
      setTypingUsers(prev => {
        const newState = { 
          ...prev, 
          [data.userId]: {
            isTyping: data.isTyping,
            username: data.username 
          }
        };
        
        console.log("Nuevo estado de typingUsers:", newState); // Depuración
        return newState;
      });
      
      if (!data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => {
            const updated = {...prev};
            delete updated[data.userId];
            return updated;
          });
        }, 1000);
      }
    });

    return () => {
      socket.off('previousMessages');
      socket.off('newMessage');
      socket.off('usersOnline');
      socket.off('userConnected');
      socket.off('userDisconnected');
      socket.off('userTyping');
    };
  }, [socket, user]);

  const handleSendMessage = async (message, imageUrl) => {
    if (!message && !imageUrl || !socket) return;
  
    const newMessage = {
      message: message || "",
      senderId: user.uid,
      senderName: user.displayName || 'Usuario',
      timestamp: new Date(),
      imageUrl: imageUrl || null,
    };
  
    try {
      await addDoc(collection(db, 'messages'), newMessage);
      socket.emit('sendMessage', newMessage);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };
  
  const handleTyping = (isTyping) => {
    if (!socket) return;
    
    const typingData = { 
      userId: user.uid, 
      username: user.displayName || 'Usuario',
      isTyping 
    };
    
    console.log("Enviando evento typing:", typingData); // Depuración
    socket.emit('typing', typingData);
  };

  // Depuración
  useEffect(() => {
    console.log("Estado actual de typingUsers:", typingUsers);
  }, [typingUsers]);

  return (
    <div className="main-chat">
      <ChatHeader 
        onlineUsers={onlineUsers} 
        typingUsers={typingUsers}
      />
      <MessagesArea 
        messages={messages}
        userEvents={userEvents}
        currentUserId={user.uid}
      />
      <MessageInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
      />
    </div>
  );
};