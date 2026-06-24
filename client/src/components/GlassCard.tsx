import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', ...rest }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0px 8px 30px rgba(0,0,0,0.12)' }}
      className={`bg-white/30 backdrop-blur-lg border border-white/20 rounded-xl shadow-sm p-4 ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
