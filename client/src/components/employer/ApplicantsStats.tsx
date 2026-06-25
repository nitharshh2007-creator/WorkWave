import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, CalendarDays, CheckSquare, Speech, XOctagon, Trophy } from 'lucide-react';

interface StatsData {
  totalJobs: number;
  totalApplicants: number;
  appsToday: number;
  reviewed?: number;
  shortlisted: number;
  interviews: number;
  rejected: number;
  hired: number;
}

interface ApplicantsStatsProps {
  stats: StatsData;
}

export const ApplicantsStats: React.FC<ApplicantsStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'text-[#659287] bg-[#659287]/10 border-[#659287]/20',
    },
    {
      title: 'Total Applicants',
      value: stats.totalApplicants,
      icon: Users,
      color: 'text-[#88BDA4] bg-[#88BDA4]/10 border-[#88BDA4]/20',
    },
    {
      title: 'Applications Today',
      value: stats.appsToday,
      icon: CalendarDays,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    ...(stats.reviewed !== undefined ? [{
      title: 'Reviewed',
      value: stats.reviewed,
      icon: CheckSquare,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
    }] : []),
    {
      title: 'Shortlisted',
      value: stats.shortlisted,
      icon: CheckSquare,
      color: 'text-[#2F4F46] bg-[#F0F6F2] border-[#88BDA4]/30',
    },
    {
      title: 'Interview Scheduled',
      value: stats.interviews,
      icon: Speech,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: XOctagon,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      title: 'Hired',
      value: stats.hired,
      icon: Trophy,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  } as const;

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
  } as const;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
    >
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            variants={item}
            whileHover={{ y: -4, scale: 1.02, boxShadow: '0 8px 24px rgba(47, 79, 70, 0.06)' }}
            className="bg-white border border-[#E2ECE5] rounded-2xl p-4 flex flex-col justify-between transition-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.color}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#4A6A60] uppercase tracking-wider truncate mb-1">
                {card.title}
              </p>
              <h4 className="text-xl font-extrabold text-[#2F4F46] tracking-tight">
                {card.value}
              </h4>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default ApplicantsStats;
