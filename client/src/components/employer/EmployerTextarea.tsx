import React from "react";

interface EmployerTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  isRequired?: boolean;
  maxLength?: number;
}

export const EmployerTextarea: React.FC<EmployerTextareaProps> = ({
  label,
  error,
  isRequired,
  maxLength,
  value = "",
  className = "",
  ...props
}) => {
  const currentLength = typeof value === "string" ? value.length : String(value || "").length;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-[#2F4F46] uppercase tracking-wider flex items-center gap-1">
          {label}
          {isRequired && <span className="text-red-500 font-bold">*</span>}
        </label>
        {maxLength && (
          <span className="text-xs text-[#88BDA4] font-medium">
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
      <textarea
        maxLength={maxLength}
        value={value}
        className={`w-full rounded-[16px] bg-[#FFFFFF] border border-[#E2ECE5] text-[#2F4F46] p-5 font-medium text-sm transition-all duration-200 outline-none placeholder-[#88BDA4]/60 min-h-[120px] resize-y
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              : "border-[#E2ECE5] focus:border-[#659287] focus:ring-4 focus:ring-[#659287]/10"
          }
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-semibold text-red-500 mt-0.5 pl-1">{error}</span>}
    </div>
  );
};

export default EmployerTextarea;
