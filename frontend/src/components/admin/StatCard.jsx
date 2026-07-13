const StatCard = ({ label, value }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm">
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-[#3E3A74] mt-2">{value}</p>
    </div>
  );
};

export default StatCard;
