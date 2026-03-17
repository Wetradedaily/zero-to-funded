import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { fullName, email, phone, city, experience, bullrushUsername, telegramUsername } = body;

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase.from("registrations").insert({
      full_name: fullName,
      email,
      phone,
      city,
      experience,
      bullrush_username: bullrushUsername,
      telegram_username: telegramUsername,
    });

    if (dbError) {
      console.error("DB error:", dbError);
      throw new Error("Failed to save registration");
    }

    // Send to Google Sheets via Apps Script
    const sheetUrl = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");
    if (sheetUrl) {
      try {
        await fetch(sheetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            email,
            phone,
            city,
            experience,
            bullrushUsername,
            telegramUsername,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (sheetError) {
        console.error("Google Sheets sync error:", sheetError);
        // Don't fail the registration if sheets sync fails
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
