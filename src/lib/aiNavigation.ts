type AiActionPayload = {
  table?: string;
  op?: string;
  id?: string;
  record?: Record<string, any>;
};

const TABLE_ROUTES: Record<string, string> = {
  patients: "/patients",
  beds: "/beds",
  appointments: "/appointments",
  orders: "/orders",
  medications: "/medications",
  staff: "/staff",
  alerts: "/notifications",
  bills: "/billing",
};

function firstValue(record: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value);
  }
  return "";
}

export function getAiActionRoute(payload: AiActionPayload) {
  const table = payload.table || "";
  const path = TABLE_ROUTES[table];
  if (!path) return null;

  const record = payload.record || {};
  const focusId = String(record.id || payload.id || "");
  const search = firstValue(record, [
    "name",
    "patient_name",
    "patientName",
    "number",
    "title",
    "medication",
    "test",
    "id",
  ]);

  const params = new URLSearchParams();
  params.set("aiTable", table);
  params.set("aiAt", String(Date.now()));
  if (payload.op) params.set("aiOp", payload.op);
  if (focusId) params.set("aiFocus", focusId);
  if (search && payload.op !== "insert") params.set("aiSearch", search);

  return `${path}?${params.toString()}`;
}
