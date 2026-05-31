import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

// ── Role permission map ──────────────────────────────────────────────
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "add_patient","update_patient","delete_patient","discharge_patient","list_patients","search_patients",
    "list_beds","assign_bed","free_bed","update_bed",
    "create_appointment","update_appointment","cancel_appointment","list_appointments",
    "create_order","update_order","list_orders",
    "add_medication","update_medication","list_medications",
    "add_staff","update_staff","delete_staff","list_staff",
    "create_alert","dismiss_alert","list_alerts",
    "create_bill","update_bill","list_bills",
    "record_vitals","list_audit_log",
  ],
  doctor: [
    "add_patient","update_patient","discharge_patient","list_patients","search_patients",
    "list_beds","assign_bed",
    "create_appointment","update_appointment","list_appointments",
    "create_order","update_order","list_orders",
    "add_medication","update_medication","list_medications",
    "create_alert","list_alerts",
    "list_bills",
    "record_vitals","list_staff",
  ],
  nurse: [
    "update_patient","list_patients","search_patients",
    "list_beds",
    "list_appointments",
    "list_orders",
    "add_medication","update_medication","list_medications",
    "create_alert","dismiss_alert","list_alerts",
    "record_vitals","list_staff",
  ],
  receptionist: [
    "add_patient","list_patients","search_patients",
    "list_beds","assign_bed","free_bed",
    "create_appointment","update_appointment","cancel_appointment","list_appointments",
    "list_orders",
    "create_bill","update_bill","list_bills",
    "list_staff",
  ],
};

// ── CRUD executor ────────────────────────────────────────────────────
async function exec(sb: any, action: string, data: any) {
  try {
    switch (action) {
      // ── PATIENTS ───────────────────────────────────
      case "add_patient": {
        const condition = (data.condition || "Stable").toString();
        const normalizedCondition = condition.charAt(0).toUpperCase() + condition.slice(1).toLowerCase();
        const ts = new Date().toISOString();
        const p = {
          name: data.name || "Unnamed Patient",
          date_of_birth: data.date_of_birth || null,
          age: data.age || null,
          gender: data.gender || null,
          condition: normalizedCondition,
          bed_number: data.bed_number || "Unassigned",
          doctor: data.doctor || null,
          diagnosis: data.diagnosis || "",
          allergies: data.allergies || [],
          blood_group: data.blood_group || null,
          address: data.address || null,
          phone: data.phone || null,
          email: data.email || null,
          emergency_contact: data.emergency_contact || null,
          status: "active",
          ward: data.ward || null,
          vitals: { heartRate: 0, bloodPressure: "0/0", temperature: 0, oxygenSat: 0, timestamp: ts },
          vitals_history: [],
        };
        const { data: r, error } = await sb.from("patients").insert(p).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"patients", op:"insert", record:r };
      }
      case "update_patient": {
        const { id, ...rest } = data;
        if (rest.condition) rest.condition = rest.condition.toString().charAt(0).toUpperCase() + rest.condition.toString().slice(1).toLowerCase();
        if (rest.status) rest.status = rest.status.toString().toLowerCase();
        const { data: r, error } = await sb.from("patients").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"patients", op:"update", record:r };
      }
      case "delete_patient": {
        const { error } = await sb.from("patients").delete().eq("id", data.id);
        return error ? { ok:false, error:error.message } : { ok:true, table:"patients", op:"delete", id:data.id };
      }
      case "discharge_patient": {
        const { data: r, error } = await sb.from("patients").update({ status:"discharged", discharge_date: new Date().toISOString().split("T")[0], bed_number:"Unassigned" }).eq("id", data.id).select().single();
        if (!error && r) await sb.from("beds").update({ status:"cleaning", patient_id:null }).eq("patient_id", data.id);
        return error ? { ok:false, error:error.message } : { ok:true, table:"patients", op:"update", record:r };
      }
      case "list_patients": {
        const q = sb.from("patients").select("id,name,age,gender,condition,ward,bed_number,status,doctor,diagnosis,phone").order("name");
        if (data?.status) q.eq("status", data.status);
        if (data?.ward) q.eq("ward", data.ward);
        if (data?.condition) q.eq("condition", data.condition);
        if (data?.limit) q.limit(data.limit); else q.limit(50);
        const { data: r, error } = await q;
        return error ? { ok:false, error:error.message } : { ok:true, table:"patients", op:"list", records:r };
      }
      case "search_patients": {
        const { data: r, error } = await sb.from("patients").select("*").or(`name.ilike.%${data.query}%,phone.ilike.%${data.query}%,email.ilike.%${data.query}%,diagnosis.ilike.%${data.query}%`);
        return error ? { ok:false, error:error.message } : { ok:true, table:"patients", op:"search", records:r };
      }
      case "record_vitals": {
        const { patient_id, ...vitals } = data;
        const ts = new Date().toISOString();
        const { data: r, error } = await sb.from("patients").update({ vitals: { ...vitals, recorded_at: ts }, updated_at: ts }).eq("id", patient_id).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"patients", op:"update", record:r };
      }

      // ── BEDS ───────────────────────────────────────
      case "list_beds": {
        const q = sb.from("beds").select("*").order("number");
        if (data?.status) q.eq("status", data.status);
        if (data?.ward) q.eq("ward", data.ward);
        const { data: r, error } = await q;
        return error ? { ok:false, error:error.message } : { ok:true, table:"beds", op:"list", records:r };
      }
      case "assign_bed": {
        const { data: r, error } = await sb.from("beds").update({ status:"occupied", patient_id:data.patient_id, assigned_date:new Date().toISOString().split("T")[0] }).eq("id", data.id).select().single();
        if (!error && r) await sb.from("patients").update({ bed_number:r.number, ward:r.ward }).eq("id", data.patient_id);
        return error ? { ok:false, error:error.message } : { ok:true, table:"beds", op:"update", record:r };
      }
      case "free_bed": {
        const { data: bed } = await sb.from("beds").select("patient_id").eq("id", data.id).single();
        if (bed?.patient_id) await sb.from("patients").update({ bed_number:"Unassigned" }).eq("id", bed.patient_id);
        const { data: r, error } = await sb.from("beds").update({ status:"cleaning", patient_id:null, assigned_date:null }).eq("id", data.id).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"beds", op:"update", record:r };
      }
      case "update_bed": {
        const { id, ...rest } = data;
        const { data: r, error } = await sb.from("beds").update(rest).eq("id", id).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"beds", op:"update", record:r };
      }

      // ── APPOINTMENTS ───────────────────────────────
      case "create_appointment": {
        const p = { patient_id:data.patient_id||null, patient_name:data.patient_name, doctor:data.doctor, date:data.date, time:data.time, type:data.type||"General", status:data.status||"pending", phone:data.phone||null, notes:data.notes||null };
        const { data: r, error } = await sb.from("appointments").insert(p).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"appointments", op:"insert", record:r };
      }
      case "update_appointment": {
        const { id, ...rest } = data;
        const { data: r, error } = await sb.from("appointments").update({ ...rest, updated_at:new Date().toISOString() }).eq("id", id).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"appointments", op:"update", record:r };
      }
      case "cancel_appointment": {
        const { data: r, error } = await sb.from("appointments").update({ status:"cancelled" }).eq("id", data.id).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"appointments", op:"update", record:r };
      }
      case "list_appointments": {
        const q = sb.from("appointments").select("*").order("date", { ascending:true });
        if (data?.status) q.eq("status", data.status);
        if (data?.doctor) q.eq("doctor", data.doctor);
        if (data?.date) q.eq("date", data.date);
        if (data?.limit) q.limit(data.limit); else q.limit(30);
        const { data: r, error } = await q;
        return error ? { ok:false, error:error.message } : { ok:true, table:"appointments", op:"list", records:r };
      }

      // ── ORDERS ─────────────────────────────────────
      case "create_order": {
        const p = { patient_id:data.patient_id||null, patient_name:data.patient_name, type:data.type, test:data.test, doctor:data.doctor, status:data.status||"pending", priority:data.priority||"routine" };
        const { data: r, error } = await sb.from("orders").insert(p).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"orders", op:"insert", record:r };
      }
      case "update_order": {
        const { id, ...rest } = data;
        const { data: r, error } = await sb.from("orders").update(rest).eq("id", id).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"orders", op:"update", record:r };
      }
      case "list_orders": {
        const q = sb.from("orders").select("*").order("created_at", { ascending:false }).limit(30);
        if (data?.status) q.eq("status", data.status);
        if (data?.type) q.eq("type", data.type);
        const { data: r, error } = await q;
        return error ? { ok:false, error:error.message } : { ok:true, table:"orders", op:"list", records:r };
      }

      // ── MEDICATIONS ────────────────────────────────
      case "add_medication": {
        const p = { patient_id:data.patient_id||null, patient_name:data.patient_name, medication:data.medication, dosage:data.dosage, frequency:data.frequency, doctor:data.doctor, start_date:data.start_date||new Date().toISOString().split("T")[0], end_date:data.end_date||null, status:data.status||"active" };
        const { data: r, error } = await sb.from("medications").insert(p).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"medications", op:"insert", record:r };
      }
      case "update_medication": {
        const { id, ...rest } = data;
        const { data: r, error } = await sb.from("medications").update(rest).eq("id", id).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"medications", op:"update", record:r };
      }
      case "list_medications": {
        const q = sb.from("medications").select("*").order("created_at", { ascending:false }).limit(30);
        if (data?.status) q.eq("status", data.status);
        if (data?.patient_id) q.eq("patient_id", data.patient_id);
        const { data: r, error } = await q;
        return error ? { ok:false, error:error.message } : { ok:true, table:"medications", op:"list", records:r };
      }

      // ── STAFF ──────────────────────────────────────
      case "add_staff": {
        const { data: r, error } = await sb.from("staff").insert(data).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"staff", op:"insert", record:r };
      }
      case "update_staff": {
        const { id, ...rest } = data;
        const { data: r, error } = await sb.from("staff").update(rest).eq("id", id).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"staff", op:"update", record:r };
      }
      case "delete_staff": {
        const { error } = await sb.from("staff").delete().eq("id", data.id);
        return error ? { ok:false, error:error.message } : { ok:true, table:"staff", op:"delete", id:data.id };
      }
      case "list_staff": {
        const q = sb.from("staff").select("*").order("created_at", { ascending:false });
        if (data?.department) q.eq("department", data.department);
        if (data?.role) q.eq("role", data.role);
        const { data: r, error } = await q;
        return error ? { ok:false, error:error.message } : { ok:true, table:"staff", op:"list", records:r };
      }

      // ── ALERTS ─────────────────────────────────────
      case "create_alert": {
        const p = { type:data.type||"info", title:data.title, message:data.message, priority:data.priority||"medium", patient_id:data.patient_id||null };
        const { data: r, error } = await sb.from("alerts").insert(p).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"alerts", op:"insert", record:r };
      }
      case "dismiss_alert": {
        const { data: r, error } = await sb.from("alerts").update({ is_read:true }).eq("id", data.id).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"alerts", op:"update", record:r };
      }
      case "list_alerts": {
        const q = sb.from("alerts").select("*").order("created_at", { ascending:false }).limit(20);
        if (data?.unread_only) q.eq("is_read", false);
        const { data: r, error } = await q;
        return error ? { ok:false, error:error.message } : { ok:true, table:"alerts", op:"list", records:r };
      }

      // ── BILLS ──────────────────────────────────────
      case "create_bill": {
        const p = { patient_id:data.patient_id||null, patient_name:data.patient_name, amount:data.amount, status:data.status||"pending", due_date:data.due_date||null, items:data.items||[] };
        const { data: r, error } = await sb.from("bills").insert(p).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"bills", op:"insert", record:r };
      }
      case "update_bill": {
        const { id, ...rest } = data;
        const { data: r, error } = await sb.from("bills").update({ ...rest, updated_at:new Date().toISOString() }).eq("id", id).select().single();
        return error ? { ok:false, error:error.message } : { ok:true, table:"bills", op:"update", record:r };
      }
      case "list_bills": {
        const q = sb.from("bills").select("*").order("created_at", { ascending:false }).limit(30);
        if (data?.status) q.eq("status", data.status);
        const { data: r, error } = await q;
        return error ? { ok:false, error:error.message } : { ok:true, table:"bills", op:"list", records:r };
      }

      // ── AUDIT LOG ──────────────────────────────────
      case "list_audit_log": {
        const { data: r, error } = await sb.from("audit_log").select("*").order("created_at", { ascending:false }).limit(data?.limit || 20);
        return error ? { ok:false, error:error.message } : { ok:true, table:"audit_log", op:"list", records:r };
      }

      default:
        return { ok:false, error:`Unknown action: ${action}` };
    }
  } catch (e: any) {
    return { ok:false, error:e.message || "Action execution failed" };
  }
}

// ── build context ────────────────────────────────────────────────────
async function buildContext(sb: any) {
  const [patients, beds, appts, staff, alerts, orders, meds, bills] = await Promise.all([
    sb.from("patients").select("id,name,age,gender,condition,ward,bed_number,status,doctor,diagnosis,phone").order("name").limit(10),
    sb.from("beds").select("id,number,ward,floor,status,patient_id").order("number").limit(15),
    sb.from("appointments").select("id,patient_name,doctor,date,time,type,status").order("date").limit(10),
    sb.from("staff").select("id,name,role,department,shift,status").order("created_at", { ascending:false }).limit(10),
    sb.from("alerts").select("id,type,title,priority,is_read").eq("is_read",false).order("created_at",{ascending:false}).limit(5),
    sb.from("orders").select("id,patient_name,type,test,doctor,status,priority").order("created_at",{ascending:false}).limit(5),
    sb.from("medications").select("id,patient_name,medication,dosage,frequency,doctor,status").eq("status","active").limit(5),
    sb.from("bills").select("id,patient_name,amount,status").order("created_at",{ascending:false}).limit(5),
  ]);

  const p = patients.data||[], b = beds.data||[], a = appts.data||[], s = staff.data||[];
  const activeP = p.filter((x:any)=>x.status==="active");
  const availB = b.filter((x:any)=>x.status==="available");

  return `
=== LIVE DATABASE ===

PATIENTS (${p.length} total, ${activeP.length} active):
${p.map((x:any)=>`• [${x.id}] ${x.name} | Age:${x.age||"?"} | ${x.condition} | Ward:${x.ward||"N/A"} | Bed:${x.bed_number||"N/A"} | Dr:${x.doctor||"N/A"} | Status:${x.status}`).join("\n")||"None"}

BEDS (${b.length} total, ${availB.length} available):
${b.map((x:any)=>`• [${x.id}] ${x.number} | Ward:${x.ward} | Floor:${x.floor} | Status:${x.status}`).join("\n")||"None"}

APPOINTMENTS:
${a.map((x:any)=>`• [${x.id}] ${x.patient_name} w/ ${x.doctor} | ${x.date} ${x.time} | ${x.type} | ${x.status}`).join("\n")||"None"}

STAFF:
${s.map((x:any)=>`• [${x.id}] ${x.name} | ${x.role} | ${x.department} | Shift:${x.shift} | ${x.status}`).join("\n")||"None"}

ACTIVE ALERTS: ${(alerts.data||[]).map((x:any)=>`• [${x.id}] [${x.priority}] ${x.title} (${x.type})`).join("\n")||"None"}

ORDERS: ${(orders.data||[]).map((x:any)=>`• [${x.id}] ${x.patient_name} | ${x.type}:${x.test} | ${x.status} | ${x.priority}`).join("\n")||"None"}

ACTIVE MEDICATIONS: ${(meds.data||[]).map((x:any)=>`• [${x.id}] ${x.patient_name}: ${x.medication} ${x.dosage} ${x.frequency}`).join("\n")||"None"}

BILLS: ${(bills.data||[]).map((x:any)=>`• [${x.id}] ${x.patient_name} | $${x.amount} | ${x.status}`).join("\n")||"None"}
`;
}

// ── system prompt ────────────────────────────────────────────────────
function buildSystemPrompt(ctx: string, userRole: string) {
  const allowed = ROLE_PERMISSIONS[userRole] || [];
  return `You are MedFlow AI, the intelligent medical co-pilot for MedFlow Hospital Management System.
Current user role: ${userRole.toUpperCase()}

${ctx}

=== ACTIONS ===
Include EXACTLY on its own line: %%ACTION:{"action":"NAME","data":{...}}%%

Your PERMITTED actions (based on ${userRole} role):
${allowed.map(a=>`- ${a}`).join("\n")}

Action signatures:
- add_patient: {name,age?,gender?,condition?,doctor?,diagnosis?,ward?,phone?,email?,blood_group?,allergies?,emergency_contact?}
- update_patient: {id,field:value,...}
- delete_patient: {id}
- discharge_patient: {id}
- list_patients: {status?,ward?,condition?,limit?}
- search_patients: {query}
- record_vitals: {patient_id,heart_rate?,blood_pressure?,temperature?,spo2?,respiratory_rate?}
- list_beds: {status?,ward?}
- assign_bed: {id(bed_uuid),patient_id}
- free_bed: {id(bed_uuid)}
- update_bed: {id,status?}
- create_appointment: {patient_name,doctor,date,time,type?,patient_id?,phone?,notes?}
- update_appointment: {id,status?,date?,time?}
- cancel_appointment: {id}
- list_appointments: {status?,doctor?,date?,limit?}
- create_order: {patient_name,type:"Lab"|"Imaging"|"Pharmacy",test,doctor,priority?,patient_id?}
- update_order: {id,status?,result?}
- list_orders: {status?,type?}
- add_medication: {patient_name,medication,dosage,frequency,doctor,patient_id?,end_date?}
- update_medication: {id,status?,dosage?}
- list_medications: {status?,patient_id?}
- add_staff: {name,role,department,shift,phone?,email?}
- update_staff: {id,shift?,status?}
- delete_staff: {id}
- list_staff: {department?,role?}
- create_alert: {title,message,type?,priority?,patient_id?}
- dismiss_alert: {id}
- list_alerts: {unread_only?}
- create_bill: {patient_name,amount,status?,due_date?,items?,patient_id?}
- update_bill: {id,status?,amount?}
- list_bills: {status?}
- list_audit_log: {limit?}

=== RULES ===
1. Use FULL UUIDs from the database context above.
2. Response must be PURE natural language. Never show JSON to the user.
3. %%ACTION%% lines are invisible to user — always include a human message.
4. ✅ for success, ❌ for failures.
5. DELETE operations: ask confirmation first.
6. Format lists as markdown tables.
7. Be concise. Bullet points. No walls of text.
8. Fill reasonable defaults for missing fields.
9. If user requests an action you cannot perform with your role, politely decline and explain which role is needed.
10. Keep responses short and professional — like a medical assistant.`;
}

// ── clean response ───────────────────────────────────────────────────
function cleanResponse(text: string) {
  const actions: Array<{ action: string; data: any }> = [];
  const re = /%%ACTION:([\s\S]*?)%%/g;
  let m;
  while ((m = re.exec(text)) !== null) { try { actions.push(JSON.parse(m[1].trim())); } catch {} }
  const clean = text.replace(/%%ACTION:[\s\S]*?%%/g,"").replace(/```json\s*\{[\s\S]*?"action"\s*:[\s\S]*?\}\s*```/g,"").replace(/^\s*\{"action"\s*:[\s\S]*?\}\s*$/gm,"").replace(/\n{3,}/g,"\n\n").trim();
  return { clean, actions };
}

// ── main ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { messages, role: userRole } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const activeRole = userRole || "admin";
    const ctx = await buildContext(sb);
    const systemPrompt = buildSystemPrompt(ctx, activeRole);

    const aiResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model:"llama-3.3-70b-versatile", messages:[{ role:"system", content:systemPrompt }, ...messages], stream:false, temperature:0.3, max_tokens:2048 }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) return json({ error:"Rate limit exceeded. Please wait." }, 429);
      console.error("Groq error:", aiResp.status, await aiResp.text());
      return json({ error:"AI service temporarily unavailable" }, 500);
    }

    const raw = (await aiResp.json()).choices?.[0]?.message?.content || "I couldn't generate a response.";
    const { clean, actions } = cleanResponse(raw);

    // Check permissions & execute
    const results: any[] = [];
    const allowed = ROLE_PERMISSIONS[activeRole] || [];
    for (const act of actions) {
      if (!allowed.includes(act.action)) {
        results.push({ action:act.action, ok:false, error:`Action '${act.action}' is not permitted for role '${activeRole}'` });
        continue;
      }
      results.push({ action:act.action, ...await exec(sb, act.action, act.data) });
    }

    let finalContent = clean;
    if (results.length > 0) {
      const statuses = results.map(r => r.ok ? `✅ **${r.action.replace(/_/g," ")}** completed.` : `❌ **${r.action.replace(/_/g," ")}** failed: ${r.error}`).join("\n\n");
      finalContent = finalContent ? `${finalContent}\n\n${statuses}` : statuses;
    }
    if (!finalContent) finalContent = "Done! Let me know if you need anything else.";

    // SSE stream
    const enc = new TextEncoder();
    const stream = new ReadableStream({
      start(c) {
        const words = finalContent.split(" ");
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i+3).join(" ") + (i+3 < words.length ? " " : "");
          c.enqueue(enc.encode(`data: ${JSON.stringify({ choices:[{ delta:{ content:chunk } }] })}\n\n`));
        }
        if (results.length > 0) c.enqueue(enc.encode(`data: ${JSON.stringify({ choices:[{ delta:{ content:"" } }], action_results:results })}\n\n`));
        c.enqueue(enc.encode("data: [DONE]\n\n"));
        c.close();
      },
    });

    return new Response(stream, { headers: { ...cors, "Content-Type": "text/event-stream" } });
  } catch (e: any) {
    console.error("chat error:", e);
    return json({ error: e.message || "Unknown error" }, 500);
  }
});
