import { Pencil, Trash2 } from "lucide-react";
import IconButton from "./IconButton";

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export default function RowActions({ onEdit, onDelete, editLabel = "Sửa", deleteLabel = "Xóa" }: RowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <IconButton icon={Pencil} label={editLabel} onClick={onEdit} />
      <IconButton icon={Trash2} label={deleteLabel} tone="danger" onClick={onDelete} />
    </div>
  );
}
