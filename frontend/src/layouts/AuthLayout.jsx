import { Link } from "react-router-dom";
import Logo from "../components/common/Logo";
const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-[1080px] min-h-[620px] bg-white rounded-[24px] shadow-xl overflow-hidden flex flex-col md:flex-row">
        <div className="hidden md:block md:w-[44%] relative">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
            alt="SHNOOR"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Build Your Career
              <br />
              With SHNOOR
            </h2>
            <p className="text-white/90 mt-4 leading-7">
              Discover exciting opportunities, collaborate with talented professionals and grow your career with SHNOOR Technologies.
            </p>
          </div>
        </div>
        <div className="w-full md:w-[56%] flex items-center justify-center px-8 lg:px-12 py-8">
          <div className="w-full max-w-md">
            <Link to="/" className="inline-block mb-6">
              <Logo />
            </Link>
            <h1 className="text-[30px] font-bold text-[#3E3A74]">
              {title}
            </h1>
            <p className="text-[#6B7280] mt-2">
              {subtitle}
            </p>
            <div className="mt-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;