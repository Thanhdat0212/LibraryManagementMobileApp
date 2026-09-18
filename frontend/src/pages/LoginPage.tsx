import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { BookMarked } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/axiosClient";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Notice from "../components/ui/Notice";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
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
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Email hoặc mật khẩu không đúng."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <BookMarked className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-3 text-lg font-semibold text-slate-900">Đăng nhập</h1>
          <p className="mt-1 text-sm text-slate-500">Hệ thống quản lý thư viện</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Notice tone="danger" message={error} />
          <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
            Đăng nhập
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
