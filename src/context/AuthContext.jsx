import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  createUserWithEmailAndPassword
} from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Nuevo estado para controlar si el perfil está completo
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    // Primero verificamos si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('whatsapp_user');
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Verificar si el perfil está completo
      setProfileComplete(!!parsedUser.displayName && !!parsedUser.photoURL);
      setLoading(false);
      return;
    }
    
    // Si no hay usuario en localStorage, verificamos Firebase
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Convertimos el usuario de Firebase a nuestro formato
        const userData = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || '',
          status: 'Disponible' // Valor por defecto
        };
        
        // Verificar si el perfil está completo
        const isComplete = !!userData.displayName && !!userData.photoURL;
        setProfileComplete(isComplete);
        
        // Si el usuario viene de un proveedor social, normalmente ya tiene perfil completo
        // Solo guardamos en localStorage si el perfil está completo
        if (isComplete) {
          setUser(userData);
          localStorage.setItem('whatsapp_user', JSON.stringify(userData));
        } else {
          // Si el perfil no está completo, solo guardamos el ID y el email
          // para completar el resto en la página de perfil
          setUser({
            uid: userData.uid,
            email: userData.email,
            // No incluimos displayName ni photoURL
          });
          setProfileComplete(false);
        }
      } else {
        setUser(null);
        setProfileComplete(true); // Reiniciar estado
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  // Función para iniciar sesión con email y contraseña
  const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Comprobar si hay datos almacenados de este usuario en localStorage
      const savedUser = JSON.parse(localStorage.getItem('whatsapp_user') || '{}');
      const isSameUser = savedUser.uid === userCredential.user.uid;
      
      // Verificamos si el perfil está completo (tanto en Firebase como en localStorage)
      const isComplete = 
        (!!userCredential.user.displayName && !!userCredential.user.photoURL) || 
        (isSameUser && !!savedUser.displayName && !!savedUser.photoURL);
      
      // Creamos el objeto de usuario
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || '',
        photoURL: userCredential.user.photoURL || '',
      };
      
      // Actualizamos el estado
      setUser(userData);
      setProfileComplete(isComplete);
      
      console.log("Profile complete?", isComplete); // Para depuración
      
      return { user: userCredential.user, profileComplete: isComplete };
    } catch (error) {
      console.error("Error al iniciar sesión con email:", error);
      throw error;
    }
  };

  // Función para registrarse con email y contraseña
  const signUpWithEmail = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Los usuarios nuevos con email no tienen perfil completo
      setProfileComplete(false);
      return { user: userCredential.user };
    } catch (error) {
      console.error("Error al registrarse con email:", error);
      throw error;
    }
  };

  // Función para iniciar sesión con Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Los usuarios de Google generalmente tienen nombre y foto
      setProfileComplete(true);
      return { user: result.user };
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      throw error;
    }
  };

  // Función para iniciar sesión con GitHub
  const signInWithGitHub = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Los usuarios de GitHub generalmente tienen nombre y foto
      setProfileComplete(true);
      return { user: result.user };
    } catch (error) {
      console.error("Error al iniciar sesión con GitHub:", error);
      throw error;
    }
  };

  // Función para actualizar datos de perfil
  const updateProfile = (profileData) => {
    // Si tenemos un usuario, actualizamos sus datos
    if (user) {
      const updatedUser = {
        ...user,
        ...profileData
      };
      setUser(updatedUser);
      setProfileComplete(true);
      localStorage.setItem('whatsapp_user', JSON.stringify(updatedUser));
    }
  };

  // Función para iniciar sesión con datos personalizados
  const login = (userData) => {
    setUser(userData);
    setProfileComplete(!!userData.displayName && !!userData.photoURL);
    localStorage.setItem('whatsapp_user', JSON.stringify(userData));
  };

  // Función para cerrar sesión
  const logout = () => {
    // Eliminar del localStorage
    localStorage.removeItem('whatsapp_user');
    
    // Si hay un usuario de Firebase, también cerramos esa sesión
    if (auth.currentUser) {
      auth.signOut();
    }
    
    setUser(null);
    setProfileComplete(true); // Reiniciar estado
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGitHub,
    updateProfile,
    profileComplete // Exportamos el estado de si el perfil está completo
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);