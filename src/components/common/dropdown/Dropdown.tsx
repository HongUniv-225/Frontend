import {
  ReactNode,
  useState,
  createContext,
  useContext,
  HTMLAttributes,
  useRef,
  useEffect,
} from "react";
import styles from "./dropdown.module.scss";
import { cn } from "../../../utils/cn";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = createContext<DropdownContextValue | undefined>(
  undefined
);

interface DropdownMenuProps {
  children: ReactNode;
}

export const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className={styles.dropdown}>{children}</div>
    </DropdownContext.Provider>
  );
};

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within DropdownMenu");
  }
  return context;
};

interface DropdownMenuTriggerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  asChild?: boolean;
}

export const DropdownMenuTrigger = ({
  children,
  asChild,
  ...props
}: DropdownMenuTriggerProps) => {
  const { open, setOpen } = useDropdown();

  if (
    asChild &&
    typeof children === "object" &&
    children !== null &&
    "props" in children
  ) {
    const child = children as React.ReactElement;
    return <child.type {...child.props} onClick={() => setOpen(!open)} />;
  }

  return (
    <div onClick={() => setOpen(!open)} {...props}>
      {children}
    </div>
  );
};

interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DropdownMenuContent = ({
  children,
  className,
  ...props
}: DropdownMenuContentProps) => {
  const { open, setOpen } = useDropdown();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div ref={ref} className={cn(styles.dropdownContent, className)} {...props}>
      {children}
    </div>
  );
};

interface DropdownMenuItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const DropdownMenuItem = ({
  children,
  className,
  onClick,
  ...props
}: DropdownMenuItemProps) => {
  const { setOpen } = useDropdown();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    setOpen(false);
  };

  return (
    <div
      className={cn(styles.dropdownItem, className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};
