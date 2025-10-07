import {
  ReactNode,
  useState,
  createContext,
  useContext,
  HTMLAttributes,
} from "react";
import styles from "./dialog.module.scss";
import { cn } from "../../../utils/cn";

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

interface DialogProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Dialog = ({
  children,
  open: controlledOpen,
  onOpenChange,
}: DialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within Dialog");
  }
  return context;
};

interface DialogTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  asChild?: boolean;
}

export const DialogTrigger = ({
  children,
  asChild,
  ...props
}: DialogTriggerProps) => {
  const { setOpen } = useDialog();

  if (
    asChild &&
    typeof children === "object" &&
    children !== null &&
    "props" in children
  ) {
    const child = children as React.ReactElement;
    return <child.type {...child.props} onClick={() => setOpen(true)} />;
  }

  return (
    <button onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  );
};

interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DialogContent = ({
  children,
  className,
  ...props
}: DialogContentProps) => {
  const { open, setOpen } = useDialog();

  if (!open) return null;

  return (
    <div className={styles.dialogOverlay} onClick={() => setOpen(false)}>
      <div
        className={cn(styles.dialogContent, className)}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        <button
          className={styles.dialogClose}
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DialogHeader = ({
  children,
  className,
  ...props
}: DialogHeaderProps) => {
  return (
    <div className={cn(styles.dialogHeader, className)} {...props}>
      {children}
    </div>
  );
};

interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export const DialogTitle = ({
  children,
  className,
  ...props
}: DialogTitleProps) => {
  return (
    <h2 className={cn(styles.dialogTitle, className)} {...props}>
      {children}
    </h2>
  );
};
