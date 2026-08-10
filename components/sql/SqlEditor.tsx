"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export type SqlEditorHandle = {
  focus: () => void;
  insert: (text: string) => void;
  replaceAll: (text: string) => void;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  minHeight?: number;
};

const SqlEditor = forwardRef<SqlEditorHandle, Props>(function SqlEditor(
  { value, onChange, onRun, placeholder, className, readOnly, minHeight = 140 },
  ref,
) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => taRef.current?.focus(),
    insert: (text: string) => {
      const ta = taRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = value.slice(0, start) + text + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        ta.focus();
        const pos = start + text.length;
        ta.setSelectionRange(pos, pos);
      });
    },
    replaceAll: (text: string) => {
      onChange(text);
      requestAnimationFrame(() => {
        const ta = taRef.current;
        if (!ta) return;
        ta.focus();
        ta.setSelectionRange(text.length, text.length);
      });
    },
  }));

  return (
    <div
      className={cn(
        "border-4 border-line bg-[#1a1a1e] transition-all duration-100",
        focused && "border-accent",
        className,
      )}
    >
      <textarea
        ref={taRef}
        value={value}
        rows={Math.max(7, Math.ceil(minHeight / 24))}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        readOnly={readOnly}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onRun?.();
            return;
          }
          if (e.key === "Tab") {
            e.preventDefault();
            const ta = e.currentTarget;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const next = value.slice(0, start) + "  " + value.slice(end);
            onChange(next);
            requestAnimationFrame(() =>
              ta.setSelectionRange(start + 2, start + 2),
            );
          }
        }}
        className="block min-h-0 w-full resize-y overflow-auto bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-[#e4e4e7] caret-[#ff3e00] outline-none placeholder:text-white/20"
        style={{ minHeight }}
      />
    </div>
  );
});

export default SqlEditor;
