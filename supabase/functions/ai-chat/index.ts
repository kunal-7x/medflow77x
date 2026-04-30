import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, action, model } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action) {
      const result = await handleAction(supabase, action);
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch hospital/medical data
    const [{ data: patients }, { data: appointments }, { data: staff }, { data: departments }] = await Promise.all([
      supabase.from("patients").select("*").limit(50),
      supabase.from("appointments").select("*").limit(50),
      supabase.from("staff").select("*").limit(50),
      supabase.from("departments").select("*").limit(20),
    ]);

    const systemPrompt = `You are MedFlow AI, an intelligent medical assistant for the MedFlow Hospital Management System. You have access to the hospital's database.

Current Database State:
- Patients (${patients?.length || 0}): ${JSON.stringify(patients?.slice(0, 5)?.map(p => ({ id: p.id, name: p.name, phone: p.phone, status: p.status })))}
- Appointments (${appointments?.length || 0}): ${JSON.stringify(appointments?.slice(0, 5)?.map(a => ({ id: a.id, patient_name: a.patient_name, doctor: a.doctor, date: a.date, status: a.status })))}
- Staff (${staff?.length || 0}): ${JSON.stringify(staff?.slice(0, 5)?.map(s => ({ id: s.id, name: s.name, role: s.role, department: s.department })))}
- Departments: ${departments?.length || 0}

You can help with:
- Patient management (add, update, search patients)
- Appointment scheduling
- Staff scheduling
- Hospital statistics and reports
- General medical inquiries

Answer based on real data. Be concise, helpful, and professional. Use markdown formatting.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: systemPrompt }, ...messages], stream: true }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

async function handleAction(supabase: any, action: any) {
  switch (action.action) {
    case "add_patient": { const { data, error } = await supabase.from("patients").insert(action.data).select().single(); return error ? { success: false, error: error.message } : { success: true, data }; }
    case "update_patient": { const { id, ...updates } = action.data; const { data, error } = await supabase.from("patients").update(updates).eq("id", id).select().single(); return error ? { success: false, error: error.message } : { success: true, data }; }
    case "add_appointment": { const { data, error } = await supabase.from("appointments").insert(action.data).select().single(); return error ? { success: false, error: error.message } : { success: true, data }; }
    case "update_appointment": { const { id, ...updates } = action.data; const { data, error } = await supabase.from("appointments").update(updates).eq("id", id).select().single(); return error ? { success: false, error: error.message } : { success: true, data }; }
    default: return { success: false, error: "Unknown action" };
  }
}