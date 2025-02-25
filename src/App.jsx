import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/Login/LoginPage';
import { Sidebar } from './components/Sidebar/Sidebar';
import { MainChat } from './components/MainChat/MainChat';
import './WhatsAppLayout.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  
  return user ? children : <Navigate to="/" />;
};

const ChatLayout = () => {
  return (
    <div className="whatsapp-container">
      <Sidebar />
      <MainChat />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatLayout />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;