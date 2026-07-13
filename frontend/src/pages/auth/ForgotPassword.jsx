import { useState } from "react";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };
  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email to receive reset instructions">
      {sent ? (
        <p className="text-sm text-success">
          If an account exists for {email}, reset instructions have been sent.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Button type="submit" fullWidth>
            Send Reset Link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};
export default ForgotPassword;
