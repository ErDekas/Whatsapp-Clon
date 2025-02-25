import React from 'react';
import { SidebarHeader } from './SidebarHeader';
import { ChatList } from './ChatList';
import { LogoutButton } from '../Login/LogoutButton';

export const Sidebar = () => {
  return (
    <div className="sidebar flex flex-col h-full">
      <SidebarHeader />
      <ChatList />
      <LogoutButton />
    </div>
  );
};