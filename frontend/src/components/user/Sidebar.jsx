import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
const menuItems = [
  { name: "Dashboard", path: "/user/dashboard" },
  { name: "My Profile", path: "/user/profile" },
  { name: "Search Jobs", path: "/user/jobs" },
  { name: "Saved Jobs", path: "/user/saved" },
  { name: "Applied Jobs", path: "/user/applied" },
  { name: "Notifications", path: "/user/notifications" },
  { name: "Settings", path: "/user/settings" }];
const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const initial = user?.fullname ? user.fullname.charAt(0).toUpperCase() : "U";
  const firstName = user?.fullname ? user.fullname.split(" ")[0] : "Welcome";
  return (
    <aside className="w-79 min-h-screen bg-[#3E3A74] flex flex-col shadow-2xl">
      <div className="px-8 py-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGzhluKdUf0IhxKsPrl1daQEZatX0_mJi8ITsuYsm8eQ&s=10"
              alt="SHNOOR"
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              SHNOOR
            </h2>
            <p className="text-gray-300 text-sm">
              Job Portal
            </p>
          </div>
        </div>
      </div>
      <div className="px-8 py-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#7393D3] flex items-center justify-center text-white text-xl font-bold">
            {initial}
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {firstName}
            </h3>
            <p className="text-gray-300 text-sm">
              Job Seeker
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-5 py-8 space-y-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-xl px-5 py-3 font-medium transition-all duration-300 ${
                isActive
                  ? "bg-white text-[#3E3A74] shadow-md"
                  : "text-white hover:bg-white/10 hover:translate-x-1"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full bg-[#7393D3] hover:bg-[#5E84D6] text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-md"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;