import { Link } from "react-router-dom";
const Logo = ({ light = false }) => {
  return (
    <Link to="/" className="flex items-center gap-3 select-none">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGzhluKdUf0IhxKsPrl1daQEZatX0_mJi8ITsuYsm8eQ&s=10"
        alt="SHNOOR"
        className="w-12 h-12 rounded-xl bg-white object-contain p-1 shadow-sm"
      />
      <div className="leading-tight">
        <h1
          className={`text-xl font-bold tracking-wide ${
            light ? "text-white" : "text-[#3E3A74]"
          }`}
        >
          SHNOOR
        </h1>
        <p
          className={`text-sm font-medium ${
            light ? "text-blue-100" : "text-[#6B7280]"
          }`}
        >
          Job Portal
        </p>
      </div>
    </Link>
  );
};
export default Logo;