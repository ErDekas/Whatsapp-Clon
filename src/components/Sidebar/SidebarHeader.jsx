import React, { useState } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileEditModal } from './ProfileEditModal';

export const SidebarHeader = () => {
  const { user } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openProfileModal = () => {
    console.log("Opening profile modal");
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <>
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
          {/* Wrapping the icon in a div to make it easier to click */}
          <div 
            className="icon-wrapper" 
            onClick={openProfileModal} 
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              padding: '8px'
            }}
          >
            <MoreVertical className="icon" />
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal 
        isOpen={isProfileModalOpen} 
        onClose={closeProfileModal} 
      />
    </>
  );
};