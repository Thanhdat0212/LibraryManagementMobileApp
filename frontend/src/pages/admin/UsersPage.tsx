import { useEffect, useState } from "react";
import { usersApi } from "../../api/usersApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { User } from "../../types/user";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable, { type Column } from "../../components/ui/DataTable";
import ErrorBanner from "../../components/ui/ErrorBanner";
import PageHeader from "../../components/ui/PageHeader";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  function load() {
    setIsLoading(true);
    setError(null);
    usersApi
      .getAll()
      .then(setUsers)
      .catch((err) => setError(getErrorMessage(err, "Không tải được danh sách người dùng.")))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function handleToggleLock(user: User) {
    setProcessingId(user.id);
    setError(null);
    try {
      if (user.isLocked) {
        await usersApi.unlock(user.id);
      } else {
        await usersApi.lock(user.id);
      }
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Không cập nhật được trạng thái tài khoản."));
    } finally {
      setProcessingId(null);
    }
  }

  const columns: Column<User>[] = [
    { header: "Họ tên", render: (u) => <span className="font-medium text-slate-900">{u.fullName}</span> },
    { header: "Email", render: (u) => u.email },
    {
      header: "Vai trò",
      render: (u) => <Badge tone={u.role === "Admin" ? "amber" : "gray"}>{u.role === "Admin" ? "Quản trị viên" : "Độc giả"}</Badge>,
    },
    {
      header: "Trạng thái",
      render: (u) => (u.isLocked ? <Badge tone="red">Đã khóa</Badge> : <Badge tone="green">Hoạt động</Badge>),
    },
    {
      header: "",
      className: "text-right",
      render: (u) => (
        <div className="flex justify-end gap-2">
          <Button
            variant={u.isLocked ? "secondary" : "danger"}
            isLoading={processingId === u.id}
            onClick={() => handleToggleLock(u)}
          >
            {u.isLocked ? "Mở khóa" : "Khóa"}
          </Button>
        </div>
      ),
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
