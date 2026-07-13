import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

const AdminLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
