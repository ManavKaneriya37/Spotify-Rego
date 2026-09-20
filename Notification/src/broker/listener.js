import { subscribeToQueue } from "./rabbit.js";
import sendEmail from "../utils/email.js";

async function startListener() {
  subscribeToQueue("user_registered", async (msg) => {
    const {
      id,
      email,
      role,
      fullname: { firstName, lastName },
    } = msg;

    const template = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Spotify Rego</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0c0e14; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0c0e14; padding: 40px 15px;">
          <tr>
            <td align="center">
              <!-- Main Email Card -->
              <table role="presentation" width="100%" style="max-width: 540px; background-color: #141824; border: 1px solid #232938; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #1e2436;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 36px; height: 36px; background-color: #10b981; border-radius: 8px; text-align: center; vertical-align: middle;">
                          <!-- Music Icon -->
                          <span style="font-size: 20px; color: #0c0e14; line-height: 36px; display: inline-block;">&#9835;</span>
                        </td>
                        <td style="padding-left: 12px; font-size: 18px; font-weight: 700; color: #f8fafc; letter-spacing: -0.02em;">
                          Spotify Rego
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 32px;">
                    <!-- Badge -->
                    <div style="display: inline-block; padding: 4px 12px; background-color: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; font-size: 12px; font-weight: 600; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">
                      Welcome Aboard
                    </div>

                    <!-- Greeting -->
                    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #f8fafc; line-height: 1.3;">
                      Welcome to Spotify Rego, ${firstName}!
                    </h1>
                    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                      Your account is all set up. You can now explore your favorite tracks, discover trending music, and enjoy high-quality streaming.
                    </p>

                    <!-- Account Summary Card -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f131d; border: 1px solid #1e2436; border-radius: 12px; margin-bottom: 28px; overflow: hidden;">
                      <tr>
                        <td style="padding: 16px 20px; border-bottom: 1px solid #1e2436; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                          Account Details
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 20px 6px 20px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="font-size: 14px; color: #94a3b8; padding: 6px 0;">Full Name</td>
                              <td align="right" style="font-size: 14px; font-weight: 600; color: #f8fafc; padding: 6px 0;">
                                ${firstName} ${lastName}
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 14px; color: #94a3b8; padding: 6px 0;">Email</td>
                              <td align="right" style="font-size: 14px; font-weight: 600; color: #f8fafc; padding: 6px 0;">
                                ${email}
                              </td>
                            </tr>
                            <tr>
                              <td style="font-size: 14px; color: #94a3b8; padding: 6px 0;">Role</td>
                              <td align="right" style="padding: 6px 0;">
                                <span style="display: inline-block; padding: 2px 10px; background-color: #1e2436; border-radius: 6px; font-size: 12px; font-weight: 600; color: #10b981; text-transform: capitalize;">
                                  ${role}
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="padding-bottom: 8px;"></td></tr>
                    </table>

                    <!-- CTA Button -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center">
                          <a href="http://localhost:5173" target="_blank" style="display: inline-block; width: 85%; padding: 14px 24px; background-color: #10b981; color: #0c0e14; text-decoration: none; font-size: 15px; font-weight: 700; border-radius: 9999px; text-align: center; letter-spacing: -0.01em;">
                            Start Listening Now
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 32px; background-color: #0e111a; border-top: 1px solid #1e2436; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                      &copy; ${new Date().getFullYear()} Spotify Rego. All rights reserved.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #475569;">
                      You received this email because you created an account with Spotify Rego.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      await sendEmail(
        email,
        "Welcome to Spotify Rego!",
        `Hello ${firstName},\n\nThank you for registering with us! We're excited to have you on board.\n\nAccount details:\n- Name: ${firstName} ${lastName}\n- Email: ${email}\n- Role: ${role}\n\nStart listening at: http://localhost:5173\n\nBest regards,\nThe Spotify Rego Team`,
        template,
      );
    } catch (err) {
      console.error("Failed to send welcome email to", email, err);
    }
  });
}

export default startListener;
