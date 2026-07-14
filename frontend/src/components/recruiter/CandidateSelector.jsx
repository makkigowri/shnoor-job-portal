const CandidateSelector = ({ candidates, selectedIds, onToggle, onToggleAll, alreadyAssignedIds = [] }) => {
  const selectableCandidates = candidates.filter((c) => !alreadyAssignedIds.includes(c.user_id));
  const allSelected =
    selectableCandidates.length > 0 && selectableCandidates.every((c) => selectedIds.includes(c.user_id));
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-100">
        <label className="flex items-center gap-3 font-medium text-gray-900">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => onToggleAll(selectableCandidates.map((c) => c.user_id))}
            className="h-4 w-4 accent-[#7393D3]"
          />
          Select All Eligible Candidates
        </label>
        <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
      </div>
      {candidates.length === 0 ? (
        <div className="p-10 text-center text-gray-500">
          No shortlisted candidates available for this assessment.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-[28rem] overflow-y-auto">
          {candidates.map((candidate) => {
            const isAssigned = alreadyAssignedIds.includes(candidate.user_id);
            return (
              <label
                key={candidate.id}
                className={`flex items-center gap-4 px-6 py-4 ${
                  isAssigned ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(candidate.user_id)}
                  disabled={isAssigned}
                  onChange={() => onToggle(candidate.user_id)}
                  className="h-4 w-4 accent-[#7393D3]"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{candidate.candidate_name}</p>
                  <p className="text-sm text-gray-500">{candidate.candidate_email}</p>
                </div>
                <span className="text-sm text-gray-500">{candidate.job_title}</span>
                {isAssigned && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Already Assigned
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default CandidateSelector;
