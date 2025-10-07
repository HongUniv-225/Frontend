import { ReactNode, HTMLAttributes } from "react";
import styles from "./badge.module.scss";
import { cn } from "../../../utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "default" | "secondary" | "outline" | "destructive";
}

const Badge = ({
  children,
  variant = "default",
  className,
  ...props
}: BadgeProps) => {
  return (
    <span className={cn(styles.badge, styles[variant], className)} {...props}>
      {children}
    </span>
  );
};

export default Badge;
