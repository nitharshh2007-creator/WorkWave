import React from 'react';

export type ApplicantStatus = 'New' | 'Applied' | 'Pending' | 'Reviewed' | 'Shortlisted' | 'Interview' | 'Interview Scheduled' | 'Interview Completed' | 'Rejected' | 'Hired';

interface ApplicantStatusBadgeProps {
  status: ApplicantStatus;
  className?: string;
}

export const ApplicantStatusBadge: React.FC<ApplicantStatusBadgeProps> = ({ status, className = '' }) => {
  const getStyles = (s: ApplicantStatus) => {
    const normalised = s.toLowerCase();
    switch (normalised) {
      case 'new':
      case 'applied':
      case 'pending':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'reviewed':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'shortlisted':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'interview':
      case 'interview scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'interview completed':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'hired':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getLabel = (s: ApplicantStatus) => {
    if (s === 'Pending') return 'Applied';
    return s;
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStyles(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {getLabel(status)}
    </span>
  );
};

export default ApplicantStatusBadge;
