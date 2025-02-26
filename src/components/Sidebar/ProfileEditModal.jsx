import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfileEditModal = ({ isOpen, onClose }) => {
  const { user, login } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: user?.displayName || '',
    status: user?.status || '',
    avatarUrl: user?.photoURL || ''
  });
  
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingAvatars, setLoadingAvatars] = useState(false);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.displayName || '',
        status: user.status || '',
        avatarUrl: user.photoURL || ''
      });
      
      // Find avatar ID based on URL
      if (user.photoURL) {
        const avatarId = avatars.find(avatar => avatar.url === user.photoURL)?.id;
        if (avatarId) {
          setSelectedAvatar(avatarId);
        }
      }
    }
  }, [user, avatars]);

  // Load avatars when component mounts
  useEffect(() => {
    const fetchAvatars = async () => {
      setLoadingAvatars(true);
      try {
        const response = await axios.get('./avatars');
        const formattedAvatars = response.data.map((avatar, index) => ({
          id: index + 1,
          url: `./avatares/${avatar}`,
          alt: `Avatar ${index + 1}`
        }));
        setAvatars(formattedAvatars);
      } catch (error) {
        console.error('Error al cargar avatares:', error);
        setAvatars([
          { id: 1, url: './avatares/avatar1.jpg', alt: 'Avatar 1' },
          { id: 2, url: './avatares/avatar2.jpg', alt: 'Avatar 2' },
          { id: 3, url: './avatares/avatar3.jpg', alt: 'Avatar 3' },
          { id: 4, url: './avatares/avatar4.jpg', alt: 'Avatar 4' },
          { id: 5, url: './avatares/avatar5.jpg', alt: 'Avatar 5' },
          { id: 6, url: './avatares/avatar6.jpg', alt: 'Avatar 6' }
        ]);
      } finally {
        setLoadingAvatars(false);
      }
    };

    if (isOpen) {
      fetchAvatars();
    }
  }, [isOpen]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar.id);
    setProfileData({
      ...profileData,
      avatarUrl: avatar.url
    });
  };

  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!profileData.status.trim()) {
      newErrors.status = 'El estado es obligatorio';
    }
    
    if (!profileData.avatarUrl) {
      newErrors.avatar = 'Debes seleccionar un avatar';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    if (validateProfileForm()) {
      setLoading(true);
      
      try {
        // Update user profile in the auth context
        login({
          ...user,
          displayName: profileData.name,
          status: profileData.status,
          photoURL: profileData.avatarUrl
        });
        
        // Close the modal after successful update
        onClose();
      } catch (error) {
        setErrors({ ...errors, general: 'Error al actualizar el perfil: ' + error.message });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold mb-4">Editar perfil</h2>
        
        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleProfileSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              placeholder="Tu nombre"
              className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <input
              type="text"
              id="status"
              name="status"
              value={profileData.status}
              onChange={handleProfileChange}
              placeholder="Tu estado"
              className={`w-full p-2 border rounded-md ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar
            </label>
            <div className="grid grid-cols-3 gap-3">
              {loadingAvatars ? (
                <p className="col-span-3 text-center py-4">Cargando avatares...</p>
              ) : (
                avatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={`cursor-pointer rounded-lg p-1 border-2 ${
                      selectedAvatar === avatar.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <img 
                      src={avatar.url} 
                      alt={avatar.alt} 
                      className="w-full aspect-square object-cover rounded"
                    />
                  </div>
                ))
              )}
            </div>
            {errors.avatar && <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>}
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md text-gray-800 hover:bg-gray-300"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 rounded-md text-white hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};