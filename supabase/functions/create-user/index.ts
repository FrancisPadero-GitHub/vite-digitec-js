import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * IF you make changes to this file, you need to redeploy the function:
 *  Sample:
 * 
 *  supabase functions deploy create-user
 * 
 */

// avoids CORS issues when calling from frontend
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173", // or "*" for testing
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Require Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // this should match the service role key in your .env file
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,                
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!    
  );

  try {
    const { email, password } = await req.json();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
