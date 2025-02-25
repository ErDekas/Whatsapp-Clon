import React from 'react';
import { ChatListItem } from './ChatListItem';

export const ChatList = () => {
  const chats = [
    { id: 1, user: "Usuario 1", time: "12:00", lastMessage: "Último mensaje..." },
    { id: 2, user: "Usuario 2", time: "11:30", lastMessage: "¿Cómo estás?" },
    { id: 3, user: "Usuario 3", time: "10:45", lastMessage: "Nos vemos luego" },
  ];

  return (
    <div className="chat-list">
      {chats.map(chat => (
        <ChatListItem key={chat.id} {...chat} />
      ))}
    </div>
  );
};