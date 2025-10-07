import type { ButtonHTMLAttributes } from "react";
import type { ReactNode } from "react";
import styles from "./button.module.scss";
import { cn } from "../../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = ({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(styles.button, styles[variant], styles[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
