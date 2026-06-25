import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, ExternalLink } from 'lucide-react';

interface ResumePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl?: string;
  candidateName: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  isOpen,
  onClose,
  resumeUrl,
  candidateName,
}) => {
  if (!isOpen) return null;

  // Resolve base API URL for files
  const getFullResumeUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Assume relative path from server
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fullUrl = getFullResumeUrl(resumeUrl);
  const isPdf = fullUrl.toLowerCase().endsWith('.pdf');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-[#E2ECE5]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E2ECE5] flex items-center justify-between bg-[#F7FAF8]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#659287]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#659287]" />
              </div>
              <div>
                <h3 className="font-bold text-[#2F4F46] text-lg">{candidateName}'s Resume</h3>
                <p className="text-xs text-[#4A6A60]">Review application documents</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {fullUrl && (
                <>
                  <a
                    href={fullUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-[#E2ECE5] text-[#2F4F46] bg-white hover:bg-[#F7FAF8] transition-all flex items-center gap-1.5 text-sm font-semibold"
                    title="Download Resume"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-[#659287] hover:bg-[#7BA89C] text-white transition-all flex items-center gap-1.5 text-sm font-semibold"
                    title="Open in New Tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Open URL</span>
                  </a>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl border border-[#E2ECE5] text-gray-400 hover:text-gray-600 hover:bg-[#F7FAF8] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-gray-50 flex items-center justify-center p-4 overflow-hidden relative">
            {fullUrl ? (
              isPdf ? (
                <iframe
                  src={`${fullUrl}#view=FitH`}
                  title={`${candidateName} Resume`}
                  className="w-full h-full rounded-2xl border border-[#E2ECE5] shadow-sm bg-white"
                />
              ) : (
                <div className="text-center p-8 bg-white border border-[#E2ECE5] rounded-2xl shadow-sm max-w-md">
                  <FileText className="w-16 h-16 text-[#659287] mx-auto mb-4" />
                  <h4 className="font-bold text-[#2F4F46] mb-2">Resume preview not available inline</h4>
                  <p className="text-sm text-[#4A6A60] mb-6">
                    This file format cannot be rendered directly in the browser. Please download the file to view it.
                  </p>
                  <a
                    href={fullUrl}
                    download
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#659287] hover:bg-[#7BA89C] text-white font-bold transition-all shadow-lg shadow-[#659287]/20"
                  >
                    <Download className="w-4 h-4" />
                    Download Document
                  </a>
                </div>
              )
            ) : (
              <div className="text-center p-8 bg-white border border-[#E2ECE5] rounded-2xl shadow-sm max-w-md">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="font-bold text-[#2F4F46] mb-2">No Resume Provided</h4>
                <p className="text-sm text-[#4A6A60]">
                  The candidate did not upload a resume file with this application.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ResumePreview;
