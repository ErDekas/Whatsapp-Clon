import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { 
    login, 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    signInWithGitHub, 
    user
  } = useAuth();
  
  // Estado para controlar qué vista mostrar (login o personalización)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Estado para controlar si estamos en modo de inicio de sesión o registro
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Estado para las credenciales de inicio de sesión
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: ''
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

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    if (user) {
      // Evitamos recargar la página para prevenir el ciclo infinito
      navigate('/chat');
    }
  }, [user, navigate]);

  const handleCredentialChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  // Cargar avatares del servidor
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

    fetchAvatars();
  }, []);

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

  // Valida el formulario de inicio de sesión o registro
  const validateForm = () => {
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
    if (isRegisterMode && credentials.password !== credentials.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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

  // Maneja el envío del formulario de inicio de sesión o registro
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      try {
        let userCredentials;
        if (isRegisterMode) {
          // Llamar a la función de registro con email/password
          userCredentials = await signUpWithEmail(credentials.email, credentials.password);
        } else {
          // Llamar a la función de autenticación con email/password
          userCredentials = await signInWithEmail(credentials.email, credentials.password);
        }
        
        if (userCredentials?.user) {
          if (isRegisterMode) {
            setIsAuthenticated(true); // Si es registro, vamos a personalización
          } else {
            // Si es login y existe el usuario
            login({
              displayName: userCredentials.user.displayName || '',
              photoURL: userCredentials.user.photoURL || '',
              uid: userCredentials.user.uid,
              email: userCredentials.user.email
            });
            navigate('/chat');
          }
        }
      } catch (error) {
        setErrors({...errors, auth: 'Error: ' + error.message});
      }
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    try {
      let userCredentials;
      if (provider === 'google') {
        userCredentials = await signInWithGoogle();
      } else if (provider === 'github') {
        userCredentials = await signInWithGitHub();
      }
      
      if (userCredentials?.user) {
        login({
          displayName: userCredentials.user.displayName || '',
          photoURL: userCredentials.user.photoURL || '',
          uid: userCredentials.user.uid,
          email: userCredentials.user.email,
          status: 'Disponible' // Valor por defecto
        });
        navigate('/chat');
      }
    } catch (error) {
      setErrors({ ...errors, auth: `Error al iniciar sesión con ${provider}: ` + error.message });
    }
    setLoading(false);
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
        uid: user?.uid || Date.now().toString(), // Usar el UID del usuario existente o generar uno temporal
        email: user?.email || ''
      });
      
      // Redirigir sin recargar la página
      navigate('/chat');
    }
  };

  // Renderiza la vista de inicio de sesión o registro
  const renderAuthView = () => (
    <div className="login-card">
      <h1>WhatsApp Clone</h1>
      <p>{isRegisterMode ? 'Regístrate para continuar' : 'Inicia sesión para continuar'}</p>
      
      {errors.auth && <div className="error-banner">{errors.auth}</div>}
      
      <form onSubmit={handleEmailAuth}>
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
        
        {isRegisterMode && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={credentials.confirmPassword}
              onChange={handleCredentialChange}
              placeholder="Confirma tu contraseña"
              className={errors.confirmPassword ? 'input-error' : ''}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>
        )}
        
        <button 
          type="submit" 
          className="login-button" 
          disabled={loading}
        >
          {loading ? (isRegisterMode ? 'Registrando...' : 'Iniciando sesión...') : (isRegisterMode ? 'Registrarse' : 'Iniciar sesión')}
        </button>
      </form>
      
      <div className="auth-alternatives">
        <p>O inicia sesión con:</p>
        <div className="auth-buttons">
          <button 
            onClick={() => handleSocialLogin('google')} 
            className="google-auth-button" 
            disabled={loading}
          >
            Google
          </button>
          <button 
            onClick={() => handleSocialLogin('github')} 
            className="github-auth-button" 
            disabled={loading}
          >
            GitHub
          </button>
        </div>
      </div>
      
      <p className="toggle-auth-mode">
        {isRegisterMode ? (
          <span>
            ¿Ya tienes una cuenta?{' '}
            <button onClick={() => setIsRegisterMode(false)} className="toggle-auth-button">
              Inicia sesión
            </button>
          </span>
        ) : (
          <span>
            ¿No tienes una cuenta?{' '}
            <button onClick={() => setIsRegisterMode(true)} className="toggle-auth-button">
              Regístrate
            </button>
          </span>
        )}
      </p>
    </div>
  );

  // Renderiza la vista de personalización de perfil
  const renderProfileView = () => (
    <div className="login-card profile-setup">
      <h1>Personaliza tu perfil</h1>
      <p>Configura tu perfil para comenzar a chatear</p>
      
      {errors.auth && <div className="error-banner">{errors.auth}</div>}
      
      <form onSubmit={handleProfileSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profileData.name}
            onChange={handleProfileChange}
            placeholder="Tu nombre"
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
            placeholder="Tu estado"
            className={errors.status ? 'input-error' : ''}
          />
          {errors.status && <span className="error-message">{errors.status}</span>}
        </div>
        
        <div className="form-group">
          <label>Selecciona un avatar</label>
          <div className="avatar-grid">
            {loadingAvatars ? (
              <p>Cargando avatares...</p>
            ) : (
              avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`avatar-option ${selectedAvatar === avatar.id ? 'selected' : ''}`}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <img src={avatar.url} alt={avatar.alt} />
                </div>
              ))
            )}
          </div>
          {errors.avatar && <span className="error-message">{errors.avatar}</span>}
        </div>
        
        <button
          type="submit"
          className="profile-submit-button"
          disabled={loading}
        >
          {loading ? 'Guardando perfil...' : 'Comenzar a chatear'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="login-container">
      {isAuthenticated ? renderProfileView() : renderAuthView()}
    </div>
  );
};