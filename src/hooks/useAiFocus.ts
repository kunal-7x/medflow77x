import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export function useAiFocus(setSearchTerm?: (value: string) => void) {
  const [params] = useSearchParams();
  const focusId = params.get("aiFocus") || "";
  const search = params.get("aiSearch") || "";
  const op = params.get("aiOp") || "";

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
    isFocused: (id?: string) => Boolean(id && focusId === id),
    focusClass: (id?: string) => (id && focusId === id ? "ai-focus-ring" : ""),
  };
}
