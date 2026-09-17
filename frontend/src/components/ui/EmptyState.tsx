export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-12 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
