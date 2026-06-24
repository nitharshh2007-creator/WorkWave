import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  iconName: keyof typeof Icons;
  suffix?: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  iconName,
  suffix = "",
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }>;

  useEffect(() => {
    let start = 0;
    const duration = 1000; // ms
    const increment = Math.ceil(value / (duration / 16)); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-[#E6F2DD] rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#B1D3B9]/20 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-[#659287] tracking-wide uppercase">
          {title}
        </span>
        <div className="p-3 bg-[#E6F2DD] rounded-xl text-[#2F4F46] flex items-center justify-center">
          {IconComponent && <IconComponent className="w-5 h-5" />}
        </div>
      </div>

      <div className="flex items-baseline">
        <span className="text-3xl sm:text-4xl font-extrabold text-[#2F4F46] tracking-tight">
          {displayValue}
          {suffix}
        </span>
      </div>
    </motion.div>
  );
};
