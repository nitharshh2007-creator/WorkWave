import React from "react";
import { IndianRupee } from "lucide-react";
import EmployerInput from "./EmployerInput";

interface SalaryCardProps {
  salaryMin: string;
  salaryMax: string;
  onChangeMin: (val: string) => void;
  onChangeMax: (val: string) => void;
  error?: string;
  isRequired?: boolean;
}

export const SalaryCard: React.FC<SalaryCardProps> = ({
  salaryMin,
  salaryMax,
  onChangeMin,
  onChangeMax,
  error,
  isRequired,
}) => {
  const formatRupee = (val: string) => {
    const num = Number(val);
    if (isNaN(num) || !val) return "—";
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const previewText =
    salaryMin || salaryMax
      ? `${formatRupee(salaryMin)} – ${formatRupee(salaryMax)} / month`
      : "No salary range specified";

  return (
    <div
      className={`rounded-2xl p-6 border transition-all duration-200 bg-white
        ${error ? "border-red-500 shadow-sm" : "border-[#E2ECE5] shadow-[0_4px_20px_rgba(101,146,135,0.02)]"}`}
    >
      <div className="flex justify-between items-center mb-4">
        <label className="text-xs font-semibold text-[#2F4F46] uppercase tracking-wider flex items-center gap-1">
          Salary Range
          {isRequired && <span className="text-red-500 font-bold">*</span>}
        </label>
        <span className="text-xs font-bold text-[#659287] bg-[#659287]/10 px-2.5 py-1 rounded-full">
          Live Preview
        </span>
      </div>

      <div className="text-xl font-extrabold text-[#2F4F46] mb-5 flex items-center gap-2">
        <IndianRupee size={22} className="text-[#659287]" />
        <span>{previewText}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EmployerInput
          label="Minimum Salary (₹)"
          type="number"
          name="salaryMin"
          value={salaryMin}
          onChange={(e) => onChangeMin(e.target.value)}
          placeholder="e.g. 25000"
          icon={IndianRupee}
        />
        <EmployerInput
          label="Maximum Salary (₹)"
          type="number"
          name="salaryMax"
          value={salaryMax}
          onChange={(e) => onChangeMax(e.target.value)}
          placeholder="e.g. 40000"
          icon={IndianRupee}
        />
      </div>

      {error && <span className="text-xs font-semibold text-red-500 mt-2 block pl-1">{error}</span>}
    </div>
  );
};

export default SalaryCard;
