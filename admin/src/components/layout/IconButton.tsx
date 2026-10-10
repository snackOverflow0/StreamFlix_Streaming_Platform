import type { ReactNode } from "react";

export function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid size-9 place-items-center rounded-full text-slate-300 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/10 hover:text-white hover:shadow-[0_6px_20px_rgba(124,58,237,0.14)] motion-reduce:transition-none [&>svg]:size-5"
    >
      {children}
    </button>
  );
}
