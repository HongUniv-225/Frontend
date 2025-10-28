import {
  type ReactNode,
  type ImgHTMLAttributes,
  type HTMLAttributes,
} from "react";
import styles from "./avatar.module.scss";
import { cn } from "../../../utils/cn";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Avatar = ({ children, className, ...props }: AvatarProps) => {
  // children에서 AvatarImage만 찾아서 렌더링
  const findAvatarImage = (children: ReactNode): ReactNode => {
    if (Array.isArray(children)) {
      return children.find(
        (child) =>
          typeof child === "object" &&
          child !== null &&
          "type" in child &&
          child.type === AvatarImage
      );
    }

    if (
      typeof children === "object" &&
      children !== null &&
      "type" in children &&
      children.type === AvatarImage
    ) {
      return children;
    }

    return children;
  };

  return (
    <div className={cn(styles.avatar, className)} {...props}>
      {findAvatarImage(children)}
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
