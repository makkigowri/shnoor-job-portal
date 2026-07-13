const ATSScoreCard = ({ score }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-[#3E3A74]">ATS Score</h2>
      <div className="mt-6">
        <div className="w-full h-3 rounded-full bg-gray-200">
          <div className="bg-green-500 h-3 rounded-full" style={{ width: `${score}%` }} />
        </div>
        <h3 className="mt-4 text-3xl font-bold text-gray-900">{score}%</h3>
      </div>
    </div>
  );
};
export default ATSScoreCard;