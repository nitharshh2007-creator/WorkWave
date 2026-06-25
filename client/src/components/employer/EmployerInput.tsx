import React from "react";
// lucide-react does not export LucideIcon; use generic React component type for icons
import type { ComponentType } from "react";


interface EmployerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  // Accept any Lucide icon component
  icon?: ComponentType<React.SVGProps<SVGSVGElement>>;
  isRequired?: boolean;
}

export const EmployerInput: React.FC<EmployerInputProps> = ({
  label,
  error,
  icon: Icon,
  isRequired,
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
          <div className="absolute left-4 text-[#88BDA4]">
            <Icon width={18} height={18} />
          </div>
        )}
        <input
          className={`w-full h-[56px] rounded-[16px] bg-[#FFFFFF] border text-[#2F4F46] font-medium text-sm transition-all duration-200 placeholder-[#88BDA4]/60
            ${Icon ? "pl-12" : "px-5"} pr-5
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                : "border-[#E2ECE5] focus:border-[#659287] focus:ring-4 focus:ring-[#659287]/10"
            }
            outline-none ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs font-semibold text-red-500 mt-1 pl-1">{error}</span>}
    </div>
  );
};

export default EmployerInput;
