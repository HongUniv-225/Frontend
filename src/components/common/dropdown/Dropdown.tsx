import {
  type ReactNode,
  useState,
  createContext,
  useContext,
  type HTMLAttributes,
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
    return (
      <child.type {...(child.props as any)} onClick={() => setOpen(!open)} />
    );
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
  const [isUpward, setIsUpward] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);

      // 화면 위치 감지하여 위/아래 방향 결정
      const checkPosition = () => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - rect.top;
          const spaceAbove = rect.top;

          // 아래쪽 공간이 부족하면 위로 표시
          setIsUpward(spaceBelow < 200 && spaceAbove > 200);
        }
      };

      // 약간의 지연 후 위치 체크 (DOM 렌더링 완료 후)
      setTimeout(checkPosition, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        styles.dropdownContent,
        isUpward && styles.dropdownUp,
        className
      )}
      {...props}
    >
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
