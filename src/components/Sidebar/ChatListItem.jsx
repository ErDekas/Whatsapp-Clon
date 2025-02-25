import React from 'react';

export const ChatListItem = ({ user, avatar, lastMessage }) => {
  return (
    <div className="chat-item">
      <div className="chat-avatar">
          <div className="avatar"></div>
        <span className="online-indicator"></span>
      </div>
      <div className="chat-info">
        <div className="chat-name">{user}</div>
        <div className="chat-last-message">{lastMessage}</div>
      </div>
    </div>
  );
};