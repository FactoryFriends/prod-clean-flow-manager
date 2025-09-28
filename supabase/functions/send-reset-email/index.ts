import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink, userFullName }: ResetEmailRequest = await req.json();

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
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              background-color: #f8fafc;
              color: #1e293b;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              padding: 40px 30px;
              text-align: center;
            }
            .logo {
              color: #ffffff;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .tagline {
              color: #e2e8f0;
              font-size: 16px;
              margin: 0;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 20px;
              color: #1e293b;
            }
            .message {
              font-size: 16px;
              line-height: 1.6;
              color: #475569;
              margin-bottom: 30px;
            }
            .reset-button {
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: #ffffff;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              transition: all 0.2s ease;
            }
            .reset-button:hover {
              transform: translateY(-1px);
              box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.3);
            }
            .security-notice {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 16px;
              margin: 30px 0;
              border-radius: 4px;
            }
            .security-title {
              font-weight: 600;
              color: #92400e;
              margin-bottom: 8px;
            }
            .security-text {
              color: #92400e;
              font-size: 14px;
              line-height: 1.5;
              margin: 0;
            }
            .footer {
              background-color: #f1f5f9;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer-text {
              font-size: 14px;
              color: #64748b;
              margin: 0;
              line-height: 1.5;
            }
            .company-info {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
            }
            .company-name {
              font-weight: 600;
              color: #1e293b;
              font-size: 16px;
              margin-bottom: 8px;
            }
            .link-fallback {
              word-break: break-all;
              color: #3b82f6;
              font-size: 14px;
              margin-top: 20px;
              padding: 16px;
              background-color: #f8fafc;
              border-radius: 4px;
              border: 1px solid #e2e8f0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">OPTITHAI</div>
              <p class="tagline">Production Manager System</p>
            </div>
            
            <div class="content">
              <div class="greeting">Hello ${userFullName || 'there'},</div>
              
              <div class="message">
                We received a request to reset your password for your OPTITHAI Production Manager account. 
                Click the button below to create a new password:
              </div>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="reset-button">Reset My Password</a>
              </div>
              
              <div class="security-notice">
                <div class="security-title">🔒 Security Notice</div>
                <p class="security-text">
                  • This link will expire in 24 hours for your security<br>
                  • If you didn't request this reset, please ignore this email<br>
                  • Never share this link with anyone else<br>
                  • After clicking, you'll be prompted to create a new secure password
                </p>
              </div>
              
              <div class="message">
                If the button above doesn't work, copy and paste this link into your browser:
              </div>
              
              <div class="link-fallback">
                ${resetLink}
              </div>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                This email was sent from the OPTITHAI Production Manager system. 
                If you have any questions or concerns, please contact your system administrator.
              </p>
              
              <div class="company-info">
                <div class="company-name">OPTITHAI Production Manager</div>
                <p class="footer-text">Streamlining production workflows with precision and efficiency</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-reset-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);