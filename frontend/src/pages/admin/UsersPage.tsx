import { useEffect, useState } from "react";
import { usersApi } from "../../api/usersApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { User } from "../../types/user";
import Badge from "../../components/ui/Badge";
import DataTable, { type Column } from "../../components/ui/DataTable";
import ErrorBanner from "../../components/ui/ErrorBanner";
import PageHeader from "../../components/ui/PageHeader";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usersApi
      .getAll()
      .then(setUsers)
      .catch((err) => setError(getErrorMessage(err, "Không tải được danh sách người dùng.")))
      .finally(() => setIsLoading(false));
  }, []);

  const columns: Column<User>[] = [
    { header: "Họ tên", render: (u) => <span className="font-medium text-slate-900">{u.fullName}</span> },
    { header: "Email", render: (u) => u.email },
    {
      header: "Vai trò",
      render: (u) => <Badge tone={u.role === "Admin" ? "amber" : "gray"}>{u.role === "Admin" ? "Quản trị viên" : "Độc giả"}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader title="Người dùng" description="Danh sách tài khoản đã đăng ký trong hệ thống." />
      <ErrorBanner message={error} />
      <div className="mt-3">
        <DataTable columns={columns} rows={users} rowKey={(u) => u.id} isLoading={isLoading} emptyMessage="Chưa có người dùng nào." />
      </div>
    </div>
  );
}
