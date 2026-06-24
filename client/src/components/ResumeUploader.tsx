import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ResumeUploaderProps {
  existingFileName?: string;
  onUploadSuccess: (url: string) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ existingFileName, onUploadSuccess }) => {
  const [fileName, setFileName] = useState(existingFileName || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('resume', file);
    try {
      setUploading(true);
      const response = await axios.post('/api/user/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });
      toast.success('Resume uploaded successfully');
      setFileName(file.name);
      onUploadSuccess(response.data.url);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Resume upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024, // 5 MB
    multiple: false,
  });

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="border border-[#E6F2DD] rounded-xl p-4 text-center bg-white/70 backdrop-blur-xl"
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-[#659287]">Drop the PDF here …</p>
      ) : (
        <p className="text-[#2F4F46]">
          {fileName ? `Uploaded: ${fileName}` : 'Drag & drop PDF here, or click to browse'}
        </p>
      )}
      {uploading && (
        <div className="mt-2 w-full bg-[#E6F2DD] h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#659287]"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </motion.div>
  );
};
