const DashboardCards = ({ title, value }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition">
      <p className="text-gray-500">{title}</p>
      <h2 className="mt-3 text-4xl font-bold text-[#3E3A74]">{value}</h2>
    </div>
  );
};
export default DashboardCards;