import { motion } from "framer-motion";

interface ProgressCardProps {
  progress: number;
  itemsCount: number;
  completedCount: number;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  progress,
  itemsCount,
  completedCount,
}) => {
  return (
    <div className="rounded-3xl border border-[#E2ECE5] bg-white p-6 shadow-[0_8px_30px_rgba(101,146,135,0.04)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#2F4F46]">Form Completion Progress</h3>
          <p className="text-xs text-[#88BDA4] font-medium mt-0.5">
            Complete the required fields below to publish your job posting.
          </p>
        </div>
        <div className="flex items-baseline gap-1 self-start sm:self-auto">
          <span className="text-4xl font-extrabold text-[#659287] leading-none">
            {Math.round(progress)}
          </span>
          <span className="text-sm font-bold text-[#2F4F46]/60">%</span>
        </div>
      </div>

      <div className="relative w-full h-3 rounded-full bg-[#F7FAF8] overflow-hidden border border-[#E2ECE5]/50">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #659287, #88BDA4)" }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="mt-3 flex justify-between items-center text-xs text-[#88BDA4] font-semibold">
        <span>{completedCount} of {itemsCount} required sections complete</span>
        <span>{Math.round(progress) === 100 ? "Ready to publish!" : "Incomplete"}</span>
      </div>
    </div>
  );
};

export default ProgressCard;
