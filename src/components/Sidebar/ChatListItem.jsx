import React from 'react';

export const ChatListItem = ({ user, time, lastMessage }) => {
  return (
    <div className="chat-item">
      <div className="avatar"></div>
      <div className="chat-info">
        <div className="chat-header">
          <span className="chat-name">{user}</span>
          <span className="chat-time">{time}</span>
        </div>
        <p className="last-message">{lastMessage}</p>
      </div>
    </div>
  );
};