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
  noPadding?: boolean;
}

export default function TableCard({
  title,
  description,
  icon,
  badge,
  action,
  children,
  className,
  noPadding = true,
}: TableCardProps) {
  return (
    <SectionCard
      title={title}
      description={description}
      icon={icon}
      badge={badge}
      action={action}
      className={className}
      noPadding={noPadding}
    >
      {children}
    </SectionCard>
  );
}