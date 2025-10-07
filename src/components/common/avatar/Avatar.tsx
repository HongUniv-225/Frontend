import { ReactNode, ImgHTMLAttributes, HTMLAttributes } from "react";
import styles from "./avatar.module.scss";
import { cn } from "../../../utils/cn";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Avatar = ({ children, className, ...props }: AvatarProps) => {
  return (
    <div className={cn(styles.avatar, className)} {...props}>
      {children}
    </div>
  );
};

interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

export const AvatarImage = ({
  src,
  alt,
  className,
  ...props
}: AvatarImageProps) => {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt || "Avatar"}
      className={cn(styles.avatarImage, className)}
      {...props}
    />
  );
};

interface AvatarFallbackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const AvatarFallback = ({
  children,
  className,
  ...props
}: AvatarFallbackProps) => {
  return (
    <div className={cn(styles.avatarFallback, className)} {...props}>
      {children}
    </div>
  );
};
