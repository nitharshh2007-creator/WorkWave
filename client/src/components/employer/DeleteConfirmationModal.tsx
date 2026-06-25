import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  candidateName?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Remove Application',
  message = 'Are you sure you want to remove this candidate application? This action cannot be undone.',
  candidateName,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[#E2ECE5] relative z-10"
        >
          {/* Header Action Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl border border-gray-100 text-gray-400 hover:text-gray-650 hover:bg-gray-50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Main Content */}
          <div className="p-6 text-center">
            {/* Warning Icon Graphic */}
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-500">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-[#2F4F46] mb-1.5">{title}</h3>
            {candidateName && (
              <p className="text-xs font-bold text-[#659287] mb-3 bg-[#F0F6F2] px-3 py-1 rounded-xl inline-block">
                Candidate: {candidateName}
              </p>
            )}
            <p className="text-sm text-[#4A6A60] leading-relaxed mb-6">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border border-[#E2ECE5] bg-white text-xs font-bold text-[#2F4F46] hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/15"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
