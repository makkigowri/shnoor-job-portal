const JobCard = ({ title, location, applicants }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition">
      <h2 className="text-xl font-semibold text-[#3E3A74]">{title}</h2>
      <p className="mt-3 text-gray-500">{location}</p>
      <p className="mt-2 font-medium text-gray-900">Applicants : {applicants}</p>
    </div>
  );
};
export default JobCard;