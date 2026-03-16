import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center text-gray-600 mb-4">
        {icon}
      </div>
      <h3 className="text-white font-bold text-base mb-1">{title}</h3>
      <p className="text-gray-500 text-sm text-center max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}
