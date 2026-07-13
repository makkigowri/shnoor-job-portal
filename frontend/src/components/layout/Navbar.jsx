import { Link} from "react-router-dom";
import { useState } from "react";
import Logo from "../common/Logo";
const Navbar = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const handleNavigation = (id) => {
  if (window.location.pathname !== "/") {
    window.location.href = id === "top" ? "/" : `/#${id}`;
    return;
  }
  if (id === "top") {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
    return;
  }
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
};
  const navItems = [
  { name: "Home", id: "top" },
  { name: "Jobs", id: "jobs" },
  { name: "About", id: "about" },
  { name: "FAQ", id: "faq" },
  { name: "Contact", id: "footer" }
];
  return (
    <header className="sticky top-0 z-50 bg-[#3E3A74] shadow-lg">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="h-20 flex items-center justify-between">
          <Logo light />
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
             <button
  key={item.name}
  onClick={() => handleNavigation(item.id)}
  className="text-white font-medium hover:text-[#7393D3] transition duration-300"
>
  {item.name}
</button>
            ))}

          </nav>
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl border border-white text-white hover:bg-white hover:text-[#3E3A74] transition font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-xl bg-[#7393D3] text-white hover:bg-[#5E84D6] transition shadow-md font-semibold"
            >
              Register
            </Link>

          </div>
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="lg:hidden text-white text-3xl"
          >
            ☰
          </button>
        </div>
      </div>
      {mobileMenu && (
        <div className="lg:hidden bg-[#3E3A74] border-t border-white/10">
          <div className="flex flex-col p-6 gap-5">
            {navItems.map((item) => (
             <button
  key={item.name}
  onClick={() => {
    handleNavigation(item.id);
    setMobileMenu(false);
  }}
  className="text-left text-white hover:text-[#7393D3] font-medium"
>
  {item.name}
</button>
            ))}
            <Link
              to="/login"
              className="text-center py-3 rounded-xl border border-white text-white hover:bg-white hover:text-[#3E3A74] transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-center py-3 rounded-xl bg-[#7393D3] text-white hover:bg-[#5E84D6] transition"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;