import React from 'react';
import { FileText, Star, Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { ApplicantStatusBadge } from './ApplicantStatusBadge';
import type { ApplicantType } from './ApplicantCard';

interface ApplicantTableProps {
  applicants: ApplicantType[];
  onSelectApplicant: (applicant: ApplicantType) => void;
  onViewResume: (applicant: ApplicantType) => void;
  onShortlist: (applicant: ApplicantType) => void;
  onReject: (applicant: ApplicantType) => void;
  onDelete: (applicant: ApplicantType) => void;
}

export const ApplicantTable: React.FC<ApplicantTableProps> = ({
  applicants,
  onSelectApplicant,
  onViewResume,
  onShortlist,
  onReject,
  onDelete,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[#E2ECE5] bg-white shadow-sm">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-[#F7FAF8] border-b border-[#E2ECE5] text-[#2F4F46] font-bold text-xs uppercase tracking-wider sticky top-0 z-10">
            <th className="py-4 px-6">Candidate</th>
            <th className="py-4 px-5">Match</th>
            <th className="py-4 px-5">Experience</th>
            <th className="py-4 px-5">Top Skills</th>
            <th className="py-4 px-5">Education</th>
            <th className="py-4 px-5">Applied Date</th>
            <th className="py-4 px-5">Status</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2ECE5]/60">
          {applicants.map((app) => (
            <tr
              key={app.id}
              className="hover:bg-[#F7FAF8]/70 transition-colors duration-150 group"
            >
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <img
                    src={app.avatarUrl || `https://i.pravatar.cc/150?u=${app.id}`}
                    alt={app.name}
                    className="w-10 h-10 rounded-full border border-[#E2ECE5] object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${app.name}`;
                    }}
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold text-[#2F4F46] text-sm group-hover:text-[#659287] transition-colors truncate">
                      {app.name}
                    </h5>
                    <p className="text-xs text-[#4A6A60] truncate">{app.email}</p>
                  </div>
                </div>
              </td>

              <td className="py-4 px-5">
                <div className="flex items-center gap-1 font-bold text-[#659287] text-sm">
                  <Star className="w-4 h-4 fill-current text-amber-400" />
                  <span>{app.matchScore}%</span>
                </div>
              </td>

              <td className="py-4 px-5">
                <p className="text-xs font-bold text-[#2F4F46]">{app.experience}</p>
                <p className="text-[10px] text-[#4A6A60] truncate max-w-[120px]">{app.currentRole}</p>
              </td>

              <td className="py-4 px-5">
                <div className="flex flex-wrap gap-1 max-w-[160px]">
                  {app.skills.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 text-[10px] font-bold text-[#4A6A60] bg-[#E6F2DD] rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                  {app.skills.length > 2 && (
                    <span className="text-[10px] text-[#659287] font-semibold">
                      +{app.skills.length - 2}
                    </span>
                  )}
                </div>
              </td>

              <td className="py-4 px-5">
                <span className="text-xs text-[#4A6A60] truncate block max-w-[120px]" title={app.education}>
                  {app.education || 'CS Graduate'}
                </span>
              </td>

              <td className="py-4 px-5 text-xs text-[#4A6A60]">
                {app.appliedDate}
              </td>

              <td className="py-4 px-5">
                <ApplicantStatusBadge status={app.status} />
              </td>

              <td className="py-4 px-6 text-right">
                <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onViewResume(app)}
                    className="p-2 text-[#659287] hover:bg-[#659287]/10 rounded-xl transition-all"
                    title="View Resume"
                  >
                    <FileText className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => onSelectApplicant(app)}
                    className="p-2 text-[#2F4F46] hover:bg-gray-100 rounded-xl transition-all"
                    title="View Profile Details"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => onShortlist(app)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                    title="Shortlist Candidate"
                  >
                    <CheckCircle className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => onReject(app)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Reject Candidate"
                  >
                    <XCircle className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => onDelete(app)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Remove Application"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicantTable;
