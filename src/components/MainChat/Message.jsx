import React from 'react';

export const Message = ({ text, isSent, imageUrl }) => {
  if (!text && !imageUrl) return null; // Evita renderizar un mensaje vacío

  return (
    <div className={`message ${isSent ? 'sent' : 'received'}`}>
      <div className="message-bubble">
        {text && <p>{text}</p>}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Imagen enviada"
            className="message-image"
            style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '5px' }}
          />
        )}
      </div>
    </div>
  );
};
