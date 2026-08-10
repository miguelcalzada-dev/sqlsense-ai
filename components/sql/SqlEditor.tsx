"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { highlightTokens } from "@/lib/sql-highlight";

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

type CSSProperties = React.CSSProperties;

const COLOR: Record<string, CSSProperties> = {
  keyword: { color: "#cc3300", fontWeight: 700 },
  function: { color: "#2400ff", fontWeight: 700 },
  type: { color: "#008055", fontStyle: "italic" },
  string: { color: "#008055" },
  number: { color: "#b86e00" },
  ident: { color: "#111" },
  identifier: { color: "#444" },
  comment: { color: "#888", fontStyle: "italic" },
  punct: { color: "#444" },
  other: { color: "#444" },
  ws: {},
};

const SqlEditor = forwardRef<SqlEditorHandle, Props>(function SqlEditor(
  { value, onChange, onRun, placeholder, className, readOnly, minHeight = 140 },
  ref,
) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [focused, setFocused] = useState(false);

  const tokens = useMemo(() => highlightTokens(value + "\n"), [value]);

  const syncScroll = useCallback(() => {
    const ta = taRef.current;
    const pre = preRef.current;
    if (!ta || !pre) return;
    pre.scrollTop = ta.scrollTop;
    pre.scrollLeft = ta.scrollLeft;
  }, []);

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
        "relative overflow-hidden border-4 border-line bg-bg-tertiary font-mono text-sm shadow-brutal-sm transition-colors duration-100",
        focused && "border-accent",
        className,
      )}
    >
      <pre
        ref={preRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden px-4 py-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words"
        style={{ minHeight }}
      >
        <code>
          {tokens.map((t, i) =>
            t.type === "ws" ? (
              <span key={i}>{t.value}</span>
            ) : (
              <span key={i} style={COLOR[t.type] ?? {}}>
                {t.value}
              </span>
            ),
          )}
        </code>
      </pre>
      {!value && (
        <div className="absolute inset-0 px-4 py-3 font-mono text-sm leading-relaxed text-sub/30 pointer-events-none" style={{ minHeight }}>
          {placeholder || "Escribe tu SQL..."}
        </div>
      )}
      <textarea
        ref={taRef}
        value={value}
        rows={Math.max(7, Math.ceil(minHeight / 24))}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder=""
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onScroll={syncScroll}
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
        className="relative block min-h-0 w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-transparent caret-ink outline-none"
        style={{ minHeight }}
      />
    </div>
  );
});

export default SqlEditor;
