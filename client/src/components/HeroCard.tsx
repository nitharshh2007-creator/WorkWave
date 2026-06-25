import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface HeroCardProps {
  badgeText?: string;
  title: string;
  description: string;
  IconComponent: React.ComponentType<any>;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  badgeText = "WorkWave Portal",
  title,
  description,
  IconComponent,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#2F4F46] via-[#659287] to-[#88BDA4] p-8 md:p-12 text-white shadow-[0_12px_40px_rgba(47,79,70,0.1)] mb-8"
    >
      {/* Decorative shapes */}
      <div className="absolute right-[-5%] top-[-20%] h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute right-[15%] bottom-[-30%] h-60 w-60 rounded-full bg-[#88BDA4]/10 blur-2xl" />

      <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-white/10 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#88BDA4] flex items-center gap-1.5 backdrop-blur-md">
              <Star size={12} className="fill-current" />
              {badgeText}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
            {title}
          </h1>
          <p className="max-w-xl text-sm md:text-base text-white/80 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="hidden lg:flex h-24 w-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 items-center justify-center text-white shadow-inner flex-shrink-0"
        >
          <IconComponent size={40} className="text-[#88BDA4]" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroCard;
