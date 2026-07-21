import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import SectionCard from "../SectionCard/SectionCard";

interface TableCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function TableCard({
  title,
  description,
  icon,
  badge,
  action,
  children,
  className,
}: TableCardProps) {
  return (
    <SectionCard
      title={title}
      description={description}
      icon={icon}
      badge={badge}
      action={action}
      className={className}
      noPadding
    >
      {children}
    </SectionCard>
  );
}