import React from "react";
import { File, Download } from "lucide-react";

export const Message = ({ text, file, isSent, senderName, timestamp }) => {
  // No renderizar si no hay ni texto ni archivo
  if (!text && !file) return null;

  const isImage = file && file.isImage;

  // Formatear timestamp si existe
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // Función para descargar el archivo
  const handleDownload = (e) => {
    e.preventDefault();

    // Crear un enlace temporal
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name || "archivo";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`message ${isSent ? "sent" : "received"}`}>
      <div className="message-bubble">
        {!isSent && <div className="sender-name">{senderName}</div>}

        {text && <p className="message-text">{text}</p>}

        {file && isImage && (
          <div className="image-container">
            <img
              src={file.url}
              alt="Imagen"
              className="message-image"
              onClick={() => window.open(file.url, "_blank")}
            />
            <div className="image-overlay">
              <button className="download-btn" onClick={handleDownload}>
                <Download size={16} />
              </button>
            </div>
          </div>
        )}

        {file && !isImage && (
          <div className="file-container" onClick={handleDownload}>
            <div className="file-icon">
              <File size={24} />
            </div>
            <div className="file-details">
              <div className="file-name">{file.name}</div>
              <div className="file-size">{formatFileSize(file.size)}</div>
            </div>
            <button className="download-btn">
              <Download size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
