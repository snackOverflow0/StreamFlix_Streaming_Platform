import { openMobileCheckout } from "@/lib/mobile-return";
import {usePaymentAvailability} from "@/services/use-payment-availability";
import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toaster as DeferredToaster } from "@/components/ui/sonner";
import { ASSETS } from "@/features/streamflix/data";
import type { BackendPlan, SubscriptionReceipt } from "@/features/streamflix/types";
import { createSubscriptionCheckout, getSubscriptionCheckoutStatus } from "@/services/payment.service";
import { getBootstrap } from "@/services/bootstrap.service";
import { ApiError } from "@/services/api-client";

const background = { background: "radial-gradient(circle at 88% 12%, rgba(35,72,137,.48), transparent 58%), radial-gradient(circle at 22% 100%, rgba(76,24,112,.55), transparent 62%), linear-gradient(135deg,#07091b,#090b24 48%,#050611)" };

type Props = { currentPlan: string; plans: BackendPlan[]; onBackToPlans: () => void; onSubscriptionPaid: (receipt: SubscriptionReceipt) => void; onSwitchAccount: () => void };

export default function SubscriptionPaymentPage({ currentPlan, plans, onBackToPlans, onSubscriptionPaid, onSwitchAccount }: Props) {
  const availability=usePaymentAvailability();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [confirmation, setConfirmation] = useState<{ planName: string; amount: number; paymentId: string; emailSent: boolean; emailStatus?: string } | null>(null);
  const plan = plans.find((item) => item.id === currentPlan) ?? plans[0];

  useEffect(() => {
    void getBootstrap().then((data) => setEmail(data.user.email)).catch(() => undefined);
  }, []);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("subscription_session_id");
    if (!sessionId) return;
    let cancelled = false;
    let timer: number | undefined;
    let attempts = 0;
    const clearCheckoutQuery = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("subscription_session_id");
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
    };
    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        setChecking(true);
        const status = await getSubscriptionCheckoutStatus(sessionId);
        if (status.complete) {
          clearCheckoutQuery();
          localStorage.removeItem("streamflix-pending-payment");
          localStorage.removeItem("streamflix-selected-plan");
          setConfirmation({ planName: status.plan.plan_name, amount: Number(status.payment?.amount ?? status.plan.monthly_price), paymentId: status.payment?.gateway_payment_id ?? status.payment?.gateway_session_id ?? sessionId, emailSent: status.email_sent, emailStatus: status.email_status });
          return;
        }
        if (attempts < 20) {
          timer = window.setTimeout(poll, 2000);
        } else {
          setError("Payment status could not be confirmed. Check your transaction before starting another payment.");
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          clearCheckoutQuery();
          localStorage.removeItem("streamflix-pending-payment");
          setError("This Stripe checkout session is no longer available. Please start checkout again.");
        } else if (attempts < 20) {
          timer = window.setTimeout(poll, 2000);
        } else {
          setError(err instanceof Error ? err.message : "Unable to verify your payment.");
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    void poll();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  async function startCheckout() {
    if (!plan || loading) return;
    try {
      setLoading(true); setError("");
      const boot = await getBootstrap();
      const result = await createSubscriptionCheckout(boot.user.user_id, plan.backendId);
      if (!result.checkout_url) throw new Error("Stripe did not return a checkout URL.");
      localStorage.setItem("streamflix-pending-payment", JSON.stringify({ planId: plan.id, userId: boot.user.user_id, sessionId: result.session_id }));
      await openMobileCheckout(result.checkout_url);
    } catch (err) { setLoading(false); setError(err instanceof Error ? err.message : "Unable to start Stripe Checkout."); }
  }

  if (confirmation) return <main className="min-h-screen px-5 py-8 text-white" style={background}><DeferredToaster richColors /><section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-2xl items-center justify-center"><div className="w-full rounded-[2rem] border border-emerald-400/20 bg-[#0a0f23]/95 p-8 text-center shadow-2xl sm:p-12"><CheckCircle2 className="mx-auto size-16 text-emerald-400" /><Badge className="mt-5 bg-emerald-500/15 text-emerald-300">Payment successful</Badge><h1 className="mt-4 text-4xl font-black">Subscription activated</h1><p className="mt-3 text-slate-400">Your {confirmation.planName} plan is now active.</p><div className="mt-7 rounded-2xl border border-white/10 bg-white/[.03] p-5 text-left"><p><span className="text-slate-500">Amount paid</span><span className="float-right font-bold">₱{confirmation.amount.toLocaleString()}</span></p><p className="mt-3"><span className="text-slate-500">Transaction</span><span className="float-right max-w-[55%] truncate font-mono text-xs">{confirmation.paymentId}</span></p><p className="mt-3"><span className="text-slate-500">Email</span><span className="float-right text-sm">{email}</span></p></div><div className="mt-5 flex items-center justify-center gap-2 text-sm text-emerald-300"><MailCheck className="size-4" />{confirmation.emailSent ? "Confirmation accepted by Brevo" : confirmation.emailStatus === "pending" || confirmation.emailStatus === "sending" ? "Your confirmation email is queued" : "Payment saved. Contact support if your confirmation email does not arrive."}</div><Button onClick={() => onSubscriptionPaid({ id: confirmation.paymentId, planId: currentPlan, amount: confirmation.amount, paymentMethod: "Card", createdAt: new Date().toISOString(), status: "Completed" })} className="mt-8 h-12 w-full bg-gradient-to-r from-blue-600 to-violet-600 font-bold">Continue to StreamFlix</Button></div></section></main>;

  return <main className="min-h-screen px-5 py-8 text-white" style={background}><DeferredToaster richColors /><header className="flex items-center gap-2"><img src={ASSETS.logo} alt="StreamFlix" className="h-12 w-12 object-contain" /><span className="text-xl font-black text-white">streamflix</span></header><section className="mx-auto flex min-h-[calc(100vh-112px)] max-w-3xl items-center justify-center py-10"><div className="w-full rounded-[2rem] border border-white/10 bg-[#0a0f23]/95 p-6 shadow-2xl sm:p-10"><Badge className="bg-violet-500/15 text-violet-200">Secure checkout</Badge><h1 className="mt-4 text-3xl font-black">Start your {plan?.name ?? "StreamFlix"} membership</h1><p className="mt-2 text-sm text-slate-400">Signed in as {email || "your Google account"}</p><p className="mt-2 text-slate-400">Stripe securely handles your card details. StreamFlix never receives your card number or CVC.</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-violet-400/25 bg-violet-500/10 p-5"><p className="text-sm text-violet-200">Selected plan</p><p className="mt-2 text-2xl font-black">{plan?.name}</p><p className="mt-2 text-slate-300">₱{plan?.price.toLocaleString()} / 30 days</p><p className="mt-2 text-sm text-slate-400">{plan?.memberText} · {plan?.quality}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><div className="flex items-center gap-3"><CreditCard className="text-violet-300" /><div><p className="font-semibold">Card via Stripe</p><p className="text-xs text-slate-500">One-time payment · 30 days of access</p></div></div><div className="mt-5 flex items-center gap-2 text-sm text-emerald-300"><ShieldCheck className="size-4" />Secure Stripe-hosted payment</div></div></div>{!availability.card && <div role="status" className="mt-5 rounded-xl border border-amber-300/20 bg-amber-400/5 p-4 text-sm text-amber-100"><p>{availability.loading ? "Checking checkout availability…" : availability.error ? availability.error : "Card payments are not available yet. Your account is signed in, but a membership has not been purchased."}</p>{!availability.loading && <Button variant="ghost" onClick={() => void availability.refresh()} className="mt-2 h-9 px-0 text-amber-100 hover:bg-transparent hover:text-white">Check availability again</Button>}</div>}{error && <div className="mt-5 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}{checking && <div className="mt-5 flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm text-blue-200"><Loader2 className="size-4 animate-spin" />Confirming your payment and activating your subscription…</div>}<Button onClick={() => void startCheckout()} disabled={loading || checking || !plan || !availability.card} className="mt-7 h-12 w-full bg-gradient-to-r from-blue-600 to-violet-600 font-bold">{loading ? <><Loader2 className="animate-spin" />Opening Stripe…</> : "Continue to secure payment"}</Button><Button variant="ghost" onClick={onSwitchAccount} disabled={loading || checking} className="mt-2 w-full text-slate-400 hover:bg-white/5 hover:text-white">Use a different account</Button><Button variant="ghost" onClick={onBackToPlans} disabled={loading} className="mt-2 w-full text-slate-400 hover:bg-white/5 hover:text-white">Back to plans</Button></div></section></main>;
}
