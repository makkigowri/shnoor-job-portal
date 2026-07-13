import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Checkbox from "../../components/common/Checkbox";
import Button from "../../components/common/Button";
import useAuth from "../../hooks/useAuth";
const initialState = {
  fullname: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "jobseeker",
  acceptPrivacyPolicy: false,
  acceptTerms: false,
};
const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
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
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.acceptPrivacyPolicy || !form.acceptTerms) {
      setError("Please accept the Privacy Policy and Terms & Conditions.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await register({
        ...form,
        acceptPrivacyPolicy: String(form.acceptPrivacyPolicy),
        acceptTerms: String(form.acceptTerms),
      });
      navigate(
        user.role === "recruiter"
          ? "/recruiter/dashboard"
          : "/user/dashboard"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create account."
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join SHNOOR as a Job Seeker or Recruiter."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-5">
          <Input
            label="Full Name"
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
            required
          />
        </div>
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="john@example.com"
          required
        />
        <div className="grid md:grid-cols-2 gap-5">
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create Password"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
          />
        </div>
        <Select
          label="Register As"
          name="role"
          value={form.role}
          onChange={handleChange}
          options={[
            {
              value: "jobseeker",
              label: "Job Seeker",
            },
            {
              value: "recruiter",
              label: "Recruiter",
            },
          ]}
          required
        />
        <div className="space-y-3">
          <Checkbox
            name="acceptPrivacyPolicy"
            checked={form.acceptPrivacyPolicy}
            onChange={handleChange}
            label="I agree to the Privacy Policy"
          />
          <Checkbox
            name="acceptTerms"
            checked={form.acceptTerms}
            onChange={handleChange}
            label="I agree to the Terms & Conditions"
          />
        </div>
        <Button
          type="submit"
          fullWidth
          disabled={submitting}
          className="!bg-[#7393D3] hover:!bg-[#5E84D6] !rounded-xl !py-3 !text-base !font-semibold"
        >
          {submitting ? "Creating Account..." : "Create Account"}
        </Button>
        <div className="relative py-2">
          <div className="border-t border-gray-200"></div>
          <span className="absolute left-1/2 -translate-x-1/2 -top-1 bg-white px-3 text-gray-500 text-sm">
            OR
          </span>
        </div>
        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#7393D3] hover:text-[#5E84D6]"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
export default Register;