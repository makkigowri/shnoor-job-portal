const ApplicantTable = ({ applicants }) => {
  return (
    <table className="w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-5 py-4 text-left">Candidate</th>
          <th className="px-5 py-4 text-left">ATS</th>
          <th className="px-5 py-4 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {applicants.map((item) => (
          <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
            <td className="px-5 py-4">{item.name}</td>
            <td className="px-5 py-4">{item.score}%</td>
            <td className="px-5 py-4">{item.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default ApplicantTable;