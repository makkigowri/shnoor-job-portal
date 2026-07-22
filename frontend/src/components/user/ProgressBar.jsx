const ProgressBar = ({ answered, total }) => {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-gray-500">
          {answered} of {total} answered
        </span>
        <span className="font-semibold text-[#3E3A74]">{pct}%</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#7393D3] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
export default ProgressBar;
