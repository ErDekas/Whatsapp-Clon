import React from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SidebarHeader = () => {
  const { user } = useAuth();

  return (
    <div className="sidebar-header">
      <div className="flex items-center">
        {/* Avatar del usuario */}
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="Avatar"
            className="avatar"
            style={{ objectFit: 'cover', marginRight: '10px' }}
          />
        ) : (
          <div className="avatar" style={{ marginRight: '10px' }}></div>
        )}
        
        {/* Información del usuario */}
        <div className="user-info">
          <div className="font-semibold">{user?.displayName || 'Usuario'}</div>
          <div className="text-sm text-gray-500">{user?.status || 'Disponible'}</div>
        </div>
      </div>
      
      <div className="header-icons">
        <Search className="icon" />
        <MoreVertical className="icon" />
      </div>
    </div>
  );
};