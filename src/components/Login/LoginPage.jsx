import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, signInWithEmail, signInWithGoogle, signInWithGitHub } = useAuth();
  
  // Estado para controlar qué vista mostrar (login o personalización)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Estado para las credenciales de inicio de sesión
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  // Estado para los datos de perfil
  const [profileData, setProfileData] = useState({
    name: '',
    status: '',
    avatarUrl: ''
  });
  
  // Estado para los avatares del servidor
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingAvatars, setLoadingAvatars] = useState(false);

  // Cargar avatares del servidor
  useEffect(() => {
    const fetchAvatars = async () => {
      setLoadingAvatars(true);
      try {
        // Asumiendo que tienes un endpoint que devuelve la lista de avatares
        const response = await axios.get('http://localhost:5000/avatars');
        
        // Formatea los datos para que coincidan con la estructura esperada
        const formattedAvatars = response.data.map((avatar, index) => ({
          id: index + 1,
          url: `http://localhost:5000/uploads/avatares/${avatar}`,
          alt: `Avatar ${index + 1}`
        }));
        
        setAvatars(formattedAvatars);
      } catch (error) {
        console.error('Error al cargar avatares:', error);
        // Si hay un error, usar algunos avatares predeterminados como fallback
        setAvatars([
          { id: 1, url: 'http://localhost:5000/uploads/avatares/avatar1.jpg', alt: 'Avatar 1' },
          { id: 2, url: 'http://localhost:5000/uploads/avatares/avatar2.jpg', alt: 'Avatar 2' },
          { id: 3, url: 'http://localhost:5000/uploads/avatares/avatar3.jpg', alt: 'Avatar 3' },
          { id: 4, url: 'http://localhost:5000/uploads/avatares/avatar4.jpg', alt: 'Avatar 4' },
          { id: 5, url: 'http://localhost:5000/uploads/avatares/avatar5.jpg', alt: 'Avatar 5' },
          { id: 6, url: 'http://localhost:5000/uploads/avatares/avatar6.jpg', alt: 'Avatar 6' }
        ]);
      } finally {
        setLoadingAvatars(false);
      }
    };

    fetchAvatars();
  }, []);

  // Maneja cambios en los campos de email/password
  const handleCredentialChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  // Maneja cambios en los campos de perfil
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

  // Valida el formulario de inicio de sesión
  const validateLoginForm = () => {
    const newErrors = {};
    
    if (!credentials.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Formato de correo electrónico inválido';
    }
    
    if (!credentials.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Valida el formulario de perfil
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

  // Maneja el envío del formulario de inicio de sesión
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (validateLoginForm()) {
      setLoading(true);
      try {
        // Llamar a la función de autenticación con email/password
        await signInWithEmail(credentials.email, credentials.password);
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        setErrors({...errors, auth: 'Error al iniciar sesión: ' + error.message});
        setLoading(false);
      }
    }
  };

  // Maneja el inicio de sesión con Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      setErrors({...errors, auth: 'Error al iniciar sesión con Google: ' + error.message});
      setLoading(false);
    }
  };

  // Maneja el inicio de sesión con GitHub
  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      await signInWithGitHub();
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      setErrors({...errors, auth: 'Error al iniciar sesión con GitHub: ' + error.message});
      setLoading(false);
    }
  };

  // Maneja el envío del formulario de perfil
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    if (validateProfileForm()) {
      // Guardar los datos del usuario en el contexto de autenticación
      login({
        displayName: profileData.name,
        status: profileData.status,
        photoURL: profileData.avatarUrl,
        uid: Date.now().toString() // Generamos un ID único temporal o usar el de auth
      });
      
      navigate('/chat');
    }
  };

  // Renderiza la vista de inicio de sesión
  const renderLoginView = () => (
    <div className="login-card">
      <h1>WhatsApp Clone</h1>
      <p>Inicia sesión para continuar</p>
      
      {errors.auth && <div className="error-banner">{errors.auth}</div>}
      
      <form onSubmit={handleEmailLogin}>
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleCredentialChange}
            placeholder="tu@email.com"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleCredentialChange}
            placeholder="Tu contraseña"
            className={errors.password ? 'input-error' : ''}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>
        
        <button 
          type="submit" 
          className="login-button" 
          disabled={loading}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>
      
      <div className="auth-alternatives">
        <p>O inicia sesión con:</p>
        <div className="auth-buttons">
          <button 
            onClick={handleGoogleLogin} 
            className="google-auth-button" 
            disabled={loading}
          >
            Google
          </button>
          <button 
            onClick={handleGitHubLogin} 
            className="github-auth-button" 
            disabled={loading}
          >
            GitHub
          </button>
        </div>
      </div>
    </div>
  );

  // Renderiza la vista de personalización de perfil
  const renderProfileView = () => (
    <div className="login-card">
      <h1>WhatsApp Clone</h1>
      <p>Personaliza tu perfil para comenzar</p>
      
      <form onSubmit={handleProfileSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profileData.name}
            onChange={handleProfileChange}
            placeholder="Escribe tu nombre"
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Estado</label>
          <input
            type="text"
            id="status"
            name="status"
            value={profileData.status}
            onChange={handleProfileChange}
            placeholder="¿Qué estás pensando?"
            className={errors.status ? 'input-error' : ''}
          />
          {errors.status && <span className="error-message">{errors.status}</span>}
        </div>
        
        <div className="form-group">
          <label>Selecciona un avatar</label>
          <div className="avatars-container">
            {loadingAvatars ? (
              <div className="loading-avatars">Cargando avatares...</div>
            ) : (
              avatars.map((avatar) => (
                <div 
                  key={avatar.id}
                  className={`avatar-item ${selectedAvatar === avatar.id ? 'selected' : ''}`}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <img src={avatar.url} alt={avatar.alt} />
                </div>
              ))
            )}
          </div>
          {errors.avatar && <span className="error-message">{errors.avatar}</span>}
        </div>
        
        <button type="submit" className="login-button">
          Comenzar a chatear
        </button>
      </form>
    </div>
  );

  return (
    <div className="login-container">
      {isAuthenticated ? renderProfileView() : renderLoginView()}
    </div>
  );
};