import React, { type ComponentType } from "react";
import { ChevronDown } from "lucide-react";

interface EmployerSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  // Accept any Lucide icon component
  icon?: ComponentType<React.SVGProps<SVGSVGElement>>;
  isRequired?: boolean;
  options: string[];
}

export const EmployerSelect: React.FC<EmployerSelectProps> = ({
  label,
  error,
  icon: Icon,
  isRequired,
  options,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold text-[#2F4F46] uppercase tracking-wider flex items-center gap-1">
        {label}
        {isRequired && <span className="text-red-500 font-bold">*</span>}
      </label>
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-4 text-[#88BDA4] pointer-events-none">
            <Icon width={18} height={18} />
          </div>
        )}
        <select
          className={`w-full h-[56px] rounded-[16px] bg-[#FFFFFF] border text-[#2F4F46] font-medium text-sm transition-all duration-200 outline-none appearance-none cursor-pointer
            ${Icon ? "pl-12" : "px-5"} pr-10
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                : "border-[#E2ECE5] focus:border-[#659287] focus:ring-4 focus:ring-[#659287]/10"
            }
            ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute right-4 text-[#88BDA4] pointer-events-none">
          <ChevronDown size={18} />
        </div>
      </div>
      {error && <span className="text-xs font-semibold text-red-500 mt-1 pl-1">{error}</span>}
    </div>
  );
};

export default EmployerSelect;
