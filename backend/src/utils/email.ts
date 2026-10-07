import { supabase } from "../config/supabase.js";

type SubscriptionConfirmation = {
  planName: string;
  monthlyPrice: number;
  maxMembers: number;
  paymentIntentId: string;
  amount: number;
  paymentMethod: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendSubscriptionConfirmationEmail(
  userId: number,
  details: SubscriptionConfirmation
) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();

  if (!apiKey || !senderEmail) {
    console.error(
      "Brevo is not configured: BREVO_API_KEY and BREVO_SENDER_EMAIL are required"
    );
    return false;
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (userError) {
    console.error(
      "Could not get StreamFlix user for confirmation email:",
      userError.message
    );
    return false;
  }

  if (!user?.email) {
    console.error(
      `Cannot send subscription confirmation: user ${userId} has no email address`
    );
    return false;
  }

  const customerName = escapeHtml(
    user.full_name?.trim() || "StreamFlix User"
  );
  const planName = escapeHtml(details.planName);
  const paymentMethod = escapeHtml(details.paymentMethod);
  const paymentIntentId = escapeHtml(details.paymentIntentId);
  const amount = `₱${details.amount.toFixed(2)}`;
  const monthlyPrice = `₱${details.monthlyPrice.toFixed(2)}`;

  try {
    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "StreamFlix",
            email: senderEmail,
          },
          to: [
            {
              email: user.email,
              name: user.full_name ?? "StreamFlix User",
            },
          ],
          subject: "StreamFlix payment confirmation",
          htmlContent: `
            <html>
              <body style="margin:0;background:#f5f5f5;padding:30px;font-family:Arial,sans-serif;color:#111827;">
                <div style="max-width:600px;margin:auto;background:#ffffff;padding:32px;border-radius:16px;">
                  <h1 style="margin:0;color:#6d28d9;">StreamFlix</h1>
                  <h2 style="margin:24px 0 8px;">Payment confirmed</h2>
                  <p style="margin:0 0 20px;">Hi ${customerName}, your StreamFlix payment was successful and your subscription is active.</p>

                  <div style="border:1px solid #e5e7eb;border-radius:12px;padding:18px;">
                    <p><strong>Plan:</strong> ${planName}</p>
                    <p><strong>Amount paid:</strong> ${amount}</p>
                    <p><strong>Monthly price:</strong> ${monthlyPrice}</p>
                    <p><strong>Payment method:</strong> ${paymentMethod}</p>
                    <p><strong>Transaction:</strong> ${paymentIntentId}</p>
                    <p><strong>Profiles:</strong> ${details.maxMembers}</p>
                  </div>

                  <p style="margin:24px 0 0;color:#6b7280;">
                    Thank you for subscribing to StreamFlix.
                  </p>
                </div>
              </body>
            </html>
          `,
          textContent: `Hi ${user.full_name?.trim() || "StreamFlix User"},

Your StreamFlix payment was successful and your subscription is active.

Plan: ${details.planName}
Amount paid: ₱${details.amount.toFixed(2)}
Monthly price: ₱${details.monthlyPrice.toFixed(2)}
Payment method: ${details.paymentMethod}
Transaction: ${details.paymentIntentId}
Profiles: ${details.maxMembers}

Thank you for subscribing to StreamFlix.`,
        }),
      }
    );

    const result = await response.text();

    if (!response.ok) {
      console.error(
        "Brevo confirmation email failed:",
        response.status,
        result
      );
      return false;
    }

    console.log(
      `Brevo confirmation email sent to ${user.email} for ${details.paymentIntentId}`
    );
    return true;
  } catch (error) {
    console.error("Brevo confirmation email request failed:", error);
    return false;
  }
}
