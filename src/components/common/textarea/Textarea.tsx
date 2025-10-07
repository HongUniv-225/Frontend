import { TextareaHTMLAttributes, forwardRef } from "react";
import styles from "./textarea.module.scss";
import { cn } from "../../../utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(styles.textarea, className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
