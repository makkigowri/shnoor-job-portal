import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Checkbox from "../../components/common/Checkbox";
import Button from "../../components/common/Button";
import useAuth from "../../hooks/useAuth";

const LOGIN_AS_OPTIONS = [
  { value: "jobseeker", label: "Job Seeker" },
  { value: "recruiter", label: "Recruiter" },
  { value: "admin", label: "Admin" },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    loginAs: "jobseeker",
    rememberMe: false,
    acceptTerms: false,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.acceptTerms) {
      setError("Please accept the Terms & Conditions.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await login({
        email: form.email,
        password: form.password,
        role: form.loginAs,
        acceptTerms: String(form.acceptTerms),
      });

      if (user.role === "admin") {
        // The existing Admin Module (dashboard, users, jobs, etc.) reads
        // its session from these separate keys via AdminAuthContext/adminApi.
        // Mirroring the session here means that pre-built module keeps
        // working untouched, while the Admin still logs in from this same
        // shared Login page/API like everyone else.
        const token = localStorage.getItem("shnoor_token");
        localStorage.setItem("shnoor_admin_token", token);
        localStorage.setItem("shnoor_admin_user", JSON.stringify(user));
        navigate("/admin/dashboard");
      } else if (user.role === "recruiter") {
        navigate("/recruiter/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to continue your SHNOOR career journey."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
        />
        <Select
          label="Login As"
          name="loginAs"
          value={form.loginAs}
          onChange={handleChange}
          options={LOGIN_AS_OPTIONS}
          required
        />
        <div className="flex items-center justify-between">
          <Checkbox
            name="rememberMe"
            checked={form.rememberMe}
            onChange={handleChange}
            label="Remember Me"
          />
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-[#7393D3] hover:text-[#5E84D6]"
          >
            Forgot Password?
          </Link>
        </div>
        <Checkbox
          name="acceptTerms"
          checked={form.acceptTerms}
          onChange={handleChange}
          label="I agree to the Terms & Conditions"
        />
        <Button
          type="submit"
          fullWidth
          disabled={submitting}
          className="!bg-[#7393D3] hover:!bg-[#5E84D6] !rounded-xl !py-3 !text-base !font-semibold"
        >
          {submitting ? "Signing In..." : "Login"}
        </Button>
        <div className="relative py-2">
          <div className="border-t border-gray-200"></div>
          <span className="absolute left-1/2 -translate-x-1/2 -top-1 bg-white px-3 text-gray-500 text-sm">
            OR
          </span>
        </div>
        <p className="text-center text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#7393D3] hover:text-[#5E84D6]"
          >
            Create Account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
export default Login;