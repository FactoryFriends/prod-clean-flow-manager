import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetEmailRequest {
  email: string;
  resetLink: string;
  userFullName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- Auth: require valid JWT + admin role ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser(token);

    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Restrict to admin callers only
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // ---- Input validation ----
    const body = (await req.json()) as ResetEmailRequest;
    const { email, resetLink, userFullName } = body ?? {};

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (
      !resetLink ||
      typeof resetLink !== "string" ||
      !resetLink.startsWith("https://optithai-manager.lovable.app")
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid reset link" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const emailResponse = await resend.emails.send({
      from: "OPTITHAI Production Manager <no-reply@resend.dev>",
      to: [email],
      subject: "Reset Your Password - OPTITHAI Production Manager",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f8fafc;color:#1e293b;">
          <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="background:#1d4ed8;padding:40px 30px;text-align:center;">
              <div style="color:#fff;font-size:28px;font-weight:bold;margin-bottom:8px;">OPTITHAI</div>
              <p style="color:#e2e8f0;font-size:16px;margin:0;">Production Manager System</p>
            </div>
            <div style="padding:40px 30px;">
              <div style="font-size:18px;font-weight:600;margin-bottom:20px;">Hello ${userFullName || "there"},</div>
              <div style="font-size:16px;line-height:1.6;color:#475569;margin-bottom:30px;">
                We received a request to reset your password for your OPTITHAI Production Manager account.
                Click the button below to create a new password:
              </div>
              <div style="text-align:center;">
                <a href="${resetLink}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;font-size:16px;margin:20px 0;">Reset My Password</a>
              </div>
              <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;margin:30px 0;border-radius:4px;color:#92400e;font-size:14px;line-height:1.5;">
                <strong>🔒 Security Notice</strong><br>
                • This link will expire in 24 hours for your security<br>
                • If you didn't request this reset, please ignore this email<br>
                • Never share this link with anyone else
              </div>
              <div style="font-size:14px;color:#3b82f6;word-break:break-all;padding:16px;background:#f8fafc;border-radius:4px;border:1px solid #e2e8f0;">
                ${resetLink}
              </div>
            </div>
            <div style="background:#f1f5f9;padding:30px;text-align:center;border-top:1px solid #e2e8f0;font-size:14px;color:#64748b;">
              This email was sent from the OPTITHAI Production Manager system.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully");

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-reset-email function:", error?.message);
    return new Response(
      JSON.stringify({ error: "Failed to send reset email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

serve(handler);
