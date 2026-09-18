import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/axiosClient";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to={user.role === "Admin" ? "/admin/dashboard" : "/catalog"} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ fullName, email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Đăng ký thất bại. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Đăng ký tài khoản</h1>
        <p className="mt-1 text-sm text-slate-500">Tài khoản mới có vai trò độc giả (Member)</p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <Input
            label="Họ và tên"
            name="fullName"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Mật khẩu"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ErrorBanner message={error} />
          <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
            Đăng ký
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
