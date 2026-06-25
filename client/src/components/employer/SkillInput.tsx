import React, { useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cpu } from "lucide-react";

interface SkillInputProps {
  label: string;
  skills: string[];
  onChange: (skills: string[]) => void;
  error?: string;
  isRequired?: boolean;
}

export const SkillInput: React.FC<SkillInputProps> = ({
  label,
  skills,
  onChange,
  error,
  isRequired,
}) => {
  const [inputVal, setInputVal] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = inputVal.trim();
      if (val && !skills.includes(val)) {
        const newSkills = [...skills, val];
        onChange(newSkills);
        setInputVal("");
      }
    } else if (e.key === "Backspace" && !inputVal && skills.length > 0) {
      const newSkills = skills.slice(0, -1);
      onChange(newSkills);
    }
  };

  const removeSkill = (indexToRemove: number) => {
    const newSkills = skills.filter((_, idx) => idx !== indexToRemove);
    onChange(newSkills);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold text-[#2F4F46] uppercase tracking-wider flex items-center gap-1">
        {label}
        {isRequired && <span className="text-red-500 font-bold">*</span>}
      </label>
      <div
        className={`w-full min-h-[56px] py-2 px-4 rounded-[16px] bg-[#FFFFFF] border flex flex-wrap items-center gap-2 transition-all duration-200
          ${
            error
              ? "border-red-500 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10"
              : "border-[#E2ECE5] focus-within:border-[#659287] focus-within:ring-4 focus-within:ring-[#659287]/10"
          }`}
      >
        <div className="text-[#88BDA4] mr-1 flex items-center shrink-0">
          <Cpu size={18} />
        </div>
        <div className="flex flex-wrap gap-2 items-center flex-1">
          <AnimatePresence>
            {skills.map((skill, idx) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#659287]/10 text-[#659287] text-xs font-semibold"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(idx)}
                  className="hover:bg-[#659287]/20 p-0.5 rounded-full transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={skills.length === 0 ? "Type skill and press Enter" : ""}
            className="flex-1 bg-transparent border-none outline-none text-[#2F4F46] font-medium text-sm min-w-[120px] placeholder-[#88BDA4]/60 h-full py-1"
          />
        </div>
      </div>
      {error && <span className="text-xs font-semibold text-red-500 mt-1 pl-1">{error}</span>}
    </div>
  );
};

export default SkillInput;
