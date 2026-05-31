import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const AI_FOCUS_VISIBLE_MS = 5000;

export function useAiFocus(setSearchTerm?: (value: string) => void) {
  const [params] = useSearchParams();
  const focusId = params.get("aiFocus") || "";
  const search = params.get("aiSearch") || "";
  const op = params.get("aiOp") || "";
  const focusKey = params.get("aiAt") || focusId;
  const [activeFocusId, setActiveFocusId] = useState(focusId);

  useEffect(() => {
    setActiveFocusId(focusId);
    if (!focusId) return;

    const timeout = window.setTimeout(() => setActiveFocusId(""), AI_FOCUS_VISIBLE_MS);
    return () => window.clearTimeout(timeout);
  }, [focusId, focusKey]);

  useEffect(() => {
    if (!setSearchTerm) return;
    if (op === "insert") {
      setSearchTerm("");
      return;
    }
    if (search) setSearchTerm(search);
  }, [op, search, setSearchTerm]);

  return {
    focusId,
    search,
    op,
    isFocused: (id?: string) => Boolean(id && activeFocusId === id),
    focusClass: (id?: string) => (id && activeFocusId === id ? "ai-focus-ring" : ""),
  };
}
