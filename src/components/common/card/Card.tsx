import { ReactNode, HTMLAttributes } from "react";
import styles from "./card.module.scss";
import { cn } from "../../../utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div className={cn(styles.card, className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }: CardProps) => {
  return (
    <div className={cn(styles.cardHeader, className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className, ...props }: CardProps) => {
  return (
    <h3 className={cn(styles.cardTitle, className)} {...props}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className, ...props }: CardProps) => {
  return (
    <div className={cn(styles.cardContent, className)} {...props}>
      {children}
    </div>
  );
};
