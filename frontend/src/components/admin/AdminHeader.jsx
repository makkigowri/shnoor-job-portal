const AdminHeader = ({ title, subtitle }) => {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm">
      <div>
        <h1 className="text-3xl font-bold text-[#3E3A74]">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </header>
  );
};
export default AdminHeader;
