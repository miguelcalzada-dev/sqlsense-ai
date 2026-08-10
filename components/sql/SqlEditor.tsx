"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { highlightTokens } from "@/lib/sql-highlight";
import { cn } from "@/lib/utils";

export type SqlEditorHandle = {
  focus: () => void;
  insert: (text: string) => void;
  replaceAll: (text: string) => void;
};

const COLOR: Record<string, string> = {
  keyword: "rgb(var(--accent-2))",
  function: "rgb(var(--accent-5))",
  type: "rgb(var(--accent-4))",
  string: "rgb(var(--accent-4))",
  number: "rgb(var(--accent-5))",
  ident: "rgb(var(--ink))",
  identifier: "rgb(var(--ink-soft))",
  comment: "rgb(var(--sub))",
  punct: "rgb(var(--ink-soft))",
  other: "rgb(var(--ink-soft))",
  ws: "inherit",
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
  const preRef = useRef<HTMLPreElement>(null);
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

  const syncScroll = useCallback(() => {
    const ta = taRef.current;
    const pre = preRef.current;
    if (ta && pre) {
      pre.scrollTop = ta.scrollTop;
      pre.scrollLeft = ta.scrollLeft;
    }
  }, []);

  useEffect(() => {
    syncScroll();
  }, [value, syncScroll]);

  return (
    <div
      className={cn(
        "relative rounded-apple border bg-surface transition-all duration-200",
        focused
          ? "border-[rgba(var(--accent),0.5)] shadow-[0_0_0_4px_rgba(var(--accent),0.12)]"
          : "border-line-soft hover:border-line",
        className,
      )}
      style={{ minHeight }}
    >
      <div className="relative min-h-full">
          <pre
            ref={preRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre px-3 py-3 font-mono text-[13px] leading-relaxed text-transparent"
          >
            <code>
              {highlightTokens(value + (value.endsWith("\n") ? " " : "")).map(
                (t, i) => (
                  <span key={i} style={{ color: COLOR[t.type] ?? "inherit" }}>
                    {t.value}
                  </span>
                ),
              )}
            </code>
          </pre>
          <textarea
            ref={taRef}
            value={value}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
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
            className="absolute inset-0 h-full w-full resize-none whitespace-pre overflow-auto bg-transparent px-3 py-3 font-mono text-[13px] leading-relaxed text-transparent caret-ink outline-none"
            style={{ caretColor: "rgb(var(--ink))" }}
          />
      </div>
    </div>
  );
});

export default SqlEditor;