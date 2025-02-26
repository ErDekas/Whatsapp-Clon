import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider, // Descomentado
  createUserWithEmailAndPassword
} from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Primero verificamos si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('whatsapp_user');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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
        setUser(userData);
        // Guardar en localStorage para futuros accesos
        localStorage.setItem('whatsapp_user', JSON.stringify(userData));
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  // Función para iniciar sesión con email y contraseña
  const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user };
    } catch (error) {
      console.error("Error al iniciar sesión con email:", error);
      throw error;
    }
  };

  // Función para registrarse con email y contraseña
  const signUpWithEmail = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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
      return { user: result.user }; // Cambio para devolver objeto con misma estructura
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
      return { user: result.user }; // Cambio para devolver objeto con misma estructura
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
      localStorage.setItem('whatsapp_user', JSON.stringify(updatedUser));
    }
  };

  // Función para iniciar sesión con datos personalizados
  const login = (userData) => {
    setUser(userData);
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
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGitHub, // Descomentado
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);