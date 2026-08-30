import { useEffect, useRef, type CSSProperties, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
  editable?: boolean;
  onEnter?: () => void;
  onEmptyBackspace?: () => void;
  onFocus?: () => void;
  ariaLabel?: string;
}

/** Plain-text inline editable field used inside document tables and lists. */
export function Editable({
  value,
  onChange,
  className,
  style,
  placeholder,
  editable = true,
  onEnter,
  onEmptyBackspace,
  onFocus,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (node && node.innerText !== value) node.innerText = value;
  }, [value]);

  if (!editable) {
    return (
      <span className={className} style={style}>
        {value}
      </span>
    );
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onChange(event.currentTarget.innerText.trim());
      onEnter?.();
    }
    if (event.key === "Backspace" && !event.currentTarget.innerText.trim() && onEmptyBackspace) {
      event.preventDefault();
      onEmptyBackspace();
    }
  };

  return (
    <span
      ref={ref}
      role="textbox"
      tabIndex={0}
      aria-label={ariaLabel ?? placeholder}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={cn(
        "outline-none",
        "empty:before:pointer-events-none empty:before:text-[#a4adb8] empty:before:content-[attr(data-placeholder)]",
        className,
      )}
      style={style}
      onFocus={onFocus}
      onBlur={(event) => onChange(event.currentTarget.innerText.replace(/\n+/g, " ").trim())}
      onKeyDown={handleKeyDown}
    />
  );
}
