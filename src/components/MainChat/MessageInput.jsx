import React, { useState, useEffect, useRef } from "react";
import { Camera, File, Send, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Ajusta la ruta según tu estructura

export const MessageInput = ({ onSendMessage, onTyping }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Crear una URL para previsualización si es una imagen
    if (selectedFile.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);
    } else {
      // Para archivos no imagen, mostrar el nombre
      setFilePreview(selectedFile.name);
    }

    // Enviar automáticamente el mensaje con archivo si no hay texto
    if (!message.trim()) {
      await uploadAndSendFile(selectedFile, "");
    }
  };

  const uploadAndSendFile = async (fileToUpload, textMessage) => {
    if (!fileToUpload) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      const response = await axios.post(
        "/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const fileData = response.data;

      // Enviar mensaje con el archivo adjunto
      onSendMessage(textMessage, {
        url: fileData.fileUrl,
        name: fileData.originalName,
        type: fileData.mimetype,
        size: fileData.size,
        isImage: fileData.isImage,
      });

      // Limpiar estados
      clearFileAndMessage();
    } catch (error) {
      console.error("Error al subir archivo:", error);
      alert("No se pudo subir el archivo. Intente nuevamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!message.trim() && !file) return; // No hacer nada si no hay mensaje ni archivo

    if (file) {
      // Si hay archivo, subirlo junto con el mensaje
      await uploadAndSendFile(file, message.trim());
    } else {
      // Si solo hay texto, enviar mensaje de texto
      onSendMessage(message.trim());
      setMessage("");
    }

    // Informar que el usuario dejó de escribir después de enviar
    onTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const clearFileAndMessage = () => {
    if (
      filePreview &&
      typeof filePreview === "string" &&
      filePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(filePreview);
    }
    setFile(null);
    setFilePreview(null);
    setMessage("");

    // Limpiar valor del input file para permitir seleccionar el mismo archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Limpiar URLs de objeto al desmontar
  useEffect(() => {
    return () => {
      // Limpiar timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Limpiar URL de objeto si existe
      if (
        filePreview &&
        typeof filePreview === "string" &&
        filePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  return (
    <div className="message-input-container">
      {filePreview && (
        <div className="file-preview">
          {typeof filePreview === "string" &&
          filePreview.startsWith("blob:") ? (
            <img
              src={filePreview}
              alt="Vista previa"
              className="image-preview"
            />
          ) : (
            <div className="file-name-preview">
              <File size={16} />
              <span>{filePreview}</span>
            </div>
          )}
          <button
            className="remove-file-btn"
            onClick={clearFileAndMessage}
            aria-label="Eliminar archivo"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="message-input-bar">
        <label
          htmlFor="file-upload"
          className={`file-upload-label ${isUploading ? "disabled" : ""}`}
        >
          <Camera className="icon" />
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileUpload}
          disabled={isUploading}
          ref={fileInputRef}
          accept="*/*" // Aceptar cualquier tipo de archivo
          style={{ display: "none" }}
        />

        <input
          type="text"
          value={message}
          onChange={handleMessageChange}
          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
          placeholder={
            isUploading ? "Subiendo archivo..." : "Escribe un mensaje"
          }
          className="message-input"
          disabled={isUploading}
        />

        <button
          className={`send-button ${
            (!message.trim() && !file) || isUploading ? "disabled" : ""
          }`}
          onClick={handleSubmit}
          disabled={(!message.trim() && !file) || isUploading}
        >
          <Send className="icon" />
        </button>
      </div>
    </div>
  );
};
