const TimerSettings = ({ durationMinutes, passingMarks, onChange }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="font-medium text-gray-900">Duration (minutes)</label>
        <input
          type="number"
          min="1"
          value={durationMinutes}
          onChange={(e) => onChange({ durationMinutes: e.target.value })}
          className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
          placeholder="30"
        />
        <p className="mt-1 text-xs text-gray-500">Candidates are auto-submitted when the timer runs out.</p>
      </div>
      <div>
        <label className="font-medium text-gray-900">Passing Marks</label>
        <input
          type="number"
          min="0"
          value={passingMarks}
          onChange={(e) => onChange({ passingMarks: e.target.value })}
          className="w-full mt-2 border border-gray-300 rounded-xl p-3 focus:border-[#7393D3] focus:outline-none"
          placeholder="0"
        />
        <p className="mt-1 text-xs text-gray-500">Minimum total score required to mark a submission as Pass.</p>
      </div>
    </div>
  );
};
export default TimerSettings;
