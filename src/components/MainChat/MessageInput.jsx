import React, { useState, useEffect, useRef } from 'react';
import { Camera, MessageCircle } from 'lucide-react';
import axios from 'axios';

export const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const typingTimeoutRef = useRef(null);

  // Manejar cambios en el mensaje y enviar evento de typing
  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    // Informar que el usuario está escribiendo
    onTyping(true);
    
    // Limpiar timeout previo si existe
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Establecer nuevo timeout para indicar cuando el usuario deja de escribir
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleSubmit = async () => {
    if (!message.trim() && !image) return; // No hacer nada si no hay mensaje ni imagen
  
    let imageUrl = null;
    
    if (image) {
      const formData = new FormData();
      formData.append('image', image);
      
      try {
        const res = await axios.post('http://localhost:5000/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = res.data.imageUrl;
      } catch (error) {
        console.error('Error al subir imagen:', error);
        return;
      }
    }
  
    // 🚀 Asegurarse de que el mensaje se envía incluso si solo hay imagen
    onSendMessage(message.trim() || "", imageUrl);
    
    // Informar que el usuario dejó de escribir después de enviar
    onTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  
    setMessage(""); 
    setImage(null);
  };

  const handleImageUpload = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  
  // Limpiar el timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="message-input-bar">
      <label htmlFor="image-upload">
        <Camera className="icon" style={{ cursor: 'pointer' }} />
      </label>
      <input
        id="image-upload"
        type="file"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      <input
        type="text"
        value={message}
        onChange={handleMessageChange}
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Escribe un mensaje"
        className="message-input"
      />
      <MessageCircle 
        className="icon" 
        style={{ cursor: 'pointer' }}
        onClick={handleSubmit}
      />
    </div>
  );
};