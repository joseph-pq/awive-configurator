import React from 'react';
import { Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface UploadButtonProps {
  onFileSelect: (file: File) => void;
  accept?: string;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  onFileSelect,
  accept = 'image/*',
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    onFileSelect(files[0]);
  };

  return (
    <>
      <input
        type="file"
        accept={accept}
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        variant="contained"
        component="span"
        startIcon={<CloudUploadIcon />}
        onClick={handleClick}
      >
        Upload Image
      </Button>
    </>
  );
}; 