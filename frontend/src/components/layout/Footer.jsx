import { Link } from "react-router-dom";
import Logo from "../common/Logo";
const scrollToSection = (id) => {
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
    behavior: "smooth"
  });
};
const Footer = () => {
  return (
    <footer id="footer" className="bg-[#3E3A74] mt-15">
      <div className="max-w-[1400px] mx-auto px-10 lg:px-14 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Logo light />
            <p className="text-gray-300 mt-5 leading-7 max-w-[320px]">
              SHNOOR Job Portal is the official recruitment platform of SHNOOR Technologies, helping talented professionals discover exciting career opportunities.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-5">
              Quick Links
            </h3>
            <div className="flex flex-col gap-3">
              <button
  onClick={() => scrollToSection("top")}
  className="text-left text-gray-300 hover:text-[#7393D3] transition"
>
  Home
</button>
<button
  onClick={() => scrollToSection("jobs")}
  className="text-left text-gray-300 hover:text-[#7393D3] transition"
>
  Jobs
</button>

<button
  onClick={() => scrollToSection("about")}
  className="text-left text-gray-300 hover:text-[#7393D3] transition"
>
  About
</button>

<button
  onClick={() => scrollToSection("faq")}
  className="text-left text-gray-300 hover:text-[#7393D3] transition"
>
  FAQ
</button>
              <Link to="/login" className="text-gray-300 hover:text-[#7393D3] transition">
                Login
              </Link>
              <Link to="/register" className="text-gray-300 hover:text-[#7393D3] transition">
                Register
              </Link>
              <Link to="/privacy-policy" className="text-gray-300 hover:text-[#7393D3] transition">
                Privacy Policy
              </Link>
              <Link to="/terms-and-conditions" className="text-gray-300 hover:text-[#7393D3] transition">
                Terms & Conditions
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-5">
              Contact
            </h3>
            <div className="space-y-3 text-gray-300">
              <p>10009 Mount Tabor Road, Odessa, Missouri 64076, USA</p>
              <p>+91 9876543210</p>
              <a href="mailto:admin@shnoor.com" className="hover:text-[#7393D3] transition" > admin@shnoor.com </a>
            </div>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-5">
              Stay Updated
            </h3>
            <p className="text-gray-300 leading-7 mb-5">
              Follow to receive updates about the latest career opportunities at SHNOOR.
            </p>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-xl border border-transparent px-4 py-3 text-[#111827] mb-3"
            />
            <button className="w-full rounded-xl bg-[#7393D3] py-3 text-white font-semibold hover:bg-[#5E84D6] transition-all duration-300">
              Mobile Number
            </button>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 SHNOOR Technologies. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy-policy"
              className="text-gray-400 hover:text-[#7393D3] text-sm transition" >
              Privacy
            </Link>
            <Link
              to="/terms-and-conditions"
              className="text-gray-400 hover:text-[#7393D3] text-sm transition"
            >
              Terms
            </Link>
            <Link
              to="/cookies-policy"
              className="text-gray-400 hover:text-[#7393D3] text-sm transition"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;