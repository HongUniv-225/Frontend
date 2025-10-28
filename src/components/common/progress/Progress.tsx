import React from "react";
import styles from "./progress.module.scss";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className = "",
  size = "md",
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`${styles.progress} ${styles[size]} ${className}`}>
      <div className={styles.progressBar} style={{ width: `${percentage}%` }} />
    </div>
  );
};

export default Progress;
