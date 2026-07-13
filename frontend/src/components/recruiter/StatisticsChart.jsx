const values = [30, 45, 60, 55, 80, 70];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const StatisticsChart = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-[#3E3A74]">Monthly Hiring</h2>
      <div className="mt-8 h-72 flex items-end justify-between">
        {values.map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="bg-[#7393D3] rounded-t-lg w-10" style={{ height: `${value * 2}px` }} />
            <span className="mt-3 text-sm text-gray-500">{months[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default StatisticsChart;