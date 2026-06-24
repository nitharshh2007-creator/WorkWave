import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ProfilePictureUploaderProps {
  existingUrl?: string; // URL of current picture
  onUpload: (file: File) => Promise<void>;
}

export const ProfilePictureUploader: React.FC<ProfilePictureUploaderProps> = ({ existingUrl, onUpload }) => {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setUploading(true);
      try {
        await onUpload(file);
        const url = URL.createObjectURL(file);
        setPreview(url);
        toast.success('Profile picture uploaded');
      } catch (err) {
        toast.error('Failed to upload picture');
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    maxFiles: 1,
  });

  return (
    <div {...getRootProps()} className="border border-[#E6F2DD] rounded-xl p-4 text-center cursor-pointer bg-white/70 backdrop-blur-xl hover:bg-[#E6F2DD] transition-colors">
      <input {...getInputProps()} disabled={uploading} />
      {uploading ? (
        <p className="text-[#5E7C72]">Uploading...</p>
      ) : preview ? (
        <motion.img
          src={preview}
          alt="Profile"
          className="mx-auto rounded-full w-32 h-32 object-cover"
          whileHover={{ scale: 1.05 }}
        />
      ) : (
        <p className="text-[#5E7C72]">
          {isDragActive ? 'Drop the image here …' : 'Drag & drop picture, or click to select'}
        </p>
      )}
    </div>
  );
};
