import React, { useState } from 'react';
import { uploadFile, listClientFiles } from '../lib/storage';
import '../styles/FileUpload.css';

interface FileUploadProps {
  clientId: string;
  onUploadSuccess?: (filename: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ clientId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setUploading(true);
    setMessage('Uploading...');

    const result = await uploadFile(file, clientId);

    if (result.success) {
      setMessage(`✅ Uploaded: ${result.filename}`);
      setFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess(result.filename || '');
      }

      // Refresh file list
      const files = await listClientFiles(clientId);
      setUploadedFiles(files);
    } else {
      setMessage(`❌ ${result.error}`);
    }

    setUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
    }
  };

  return (
    <div className="file-upload-container">
      <div
        className="upload-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          style={{ display: 'none' }}
        />
        
        <label htmlFor="file-input" className="upload-label">
          {file ? (
            <>
              <span className="file-icon">📄</span>
              <strong>{file.name}</strong>
              <small>({(file.size / 1024 / 1024).toFixed(2)}MB)</small>
            </>
          ) : (
            <>
              <span className="upload-icon">⬆️</span>
              <strong>Drag & drop or click to select</strong>
              <small>PDF, JPG, PNG, DOC (Max 20MB)</small>
            </>
          )}
        </label>
      </div>

      {file && (
        <button
          className="btn-upload"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      )}

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="files-list">
          <h3>📂 Uploaded Files</h3>
          <ul>
            {uploadedFiles.map((f, i) => (
              <li key={i}>
                <span>{f.name}</span>
                <small>{new Date(f.updated_at).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
