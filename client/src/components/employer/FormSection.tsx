import React from "react";
import { motion } from "framer-motion";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  icon,
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-[#E2ECE5] bg-white p-8 shadow-[0_15px_40px_rgba(0,0,0,0.05)]"
    >
      <div className="mb-8 flex items-start gap-4">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#659287]/10 text-[#659287]">
            {icon}
          </div>
        )}

        <div>
          <h2
            style={{
              color: "#2F4F46",
              opacity: 1,
              fontWeight: 800,
              fontSize: "1.75rem",
              letterSpacing: "-0.02em",
              lineHeight: "1.1",
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-[#6E7F77]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children}
    </motion.div>
  );
};

export default FormSection;