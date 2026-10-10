import { useState } from "react";
import { Check, CircleCheckBig, CreditCard, ShieldCheck, Smartphone, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Toaster as DeferredToaster } from "@/components/ui/sonner";
import { ASSETS, PLANS } from "@/features/streamflix/data";
import type { SubscriptionReceipt } from "@/features/streamflix/types";

const authBackground = {
  background:
    "radial-gradient(circle at 88% 12%, rgba(35, 72, 137, 0.48) 0%, rgba(20, 36, 78, 0.2) 28%, transparent 58%), radial-gradient(circle at 22% 100%, rgba(76, 24, 112, 0.55) 0%, rgba(38, 17, 68, 0.24) 34%, transparent 62%), linear-gradient(135deg, #07091b 0%, #090b24 48%, #050611 100%)",
};

type SubscriptionPaymentPageProps = {
  currentPlan: string;
  onBackToPlans: () => void;
  onSubscriptionPaid: (receipt: SubscriptionReceipt) => void;
};

export default function SubscriptionPaymentPage({ currentPlan, onBackToPlans, onSubscriptionPaid }: SubscriptionPaymentPageProps) {
  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "card">("gcash");
  const [gcashNumber, setGcashNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [subscriptionReceipt, setSubscriptionReceipt] = useState<import("@/features/streamflix/types").SubscriptionReceipt | null>(null);

  const chosenPlan = PLANS.find((item) => item.id === currentPlan) ?? PLANS[1];


  if (subscriptionReceipt) {
      return (
        <main
          className="relative grid min-h-screen place-items-center overflow-hidden bg-[#07091b] px-5 py-10 text-white"
          style={authBackground}
        >
          <DeferredToaster richColors position="bottom-right" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.025),transparent_42%)]" />
          <section className="relative z-10 w-full max-w-lg rounded-3xl border border-emerald-400/20 bg-[#090d20]/90 p-7 text-center shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-10">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
              <CircleCheckBig className="size-9" />
            </span>
            <Badge className="mt-5 border-emerald-400/20 bg-emerald-500/10 text-emerald-200">
              Payment successful
            </Badge>
            <h1 className="mt-4 text-3xl font-black">Subscription activated</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Your {chosenPlan.name} plan is ready. A transaction record has
              been created for this prototype checkout.
            </p>

            <dl className="mt-7 divide-y divide-white/8 rounded-2xl border border-white/10 bg-white/[0.035] px-5 text-left text-sm">
              <div className="flex items-center justify-between gap-4 py-4">
                <dt className="text-slate-500">Transaction</dt>
                <dd className="font-mono text-xs text-slate-200">
                  {subscriptionReceipt.id}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-4">
                <dt className="text-slate-500">Plan</dt>
                <dd className="font-semibold">{chosenPlan.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-4">
                <dt className="text-slate-500">Payment method</dt>
                <dd>{subscriptionReceipt.paymentMethod}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-4">
                <dt className="text-slate-500">Amount paid</dt>
                <dd className="font-bold">₱{subscriptionReceipt.amount}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-4">
                <dt className="text-slate-500">Status</dt>
                <dd className="text-emerald-300">Completed</dd>
              </div>
            </dl>

            <Button
              onClick={() => onSubscriptionPaid(subscriptionReceipt)}
              className="mt-7 h-12 w-full bg-gradient-to-r from-blue-600 to-violet-600 text-base font-bold text-white hover:from-blue-500 hover:to-violet-500"
            >
              Continue to profile selection
            </Button>
          </section>
        </main>
      );
    }


  const processSteps =
      paymentMethod === "gcash"
        ? [
            "Enter your GCash mobile number",
            "Approve the payment in GCash",
            "Your subscription activates",
          ]
        : [
            "Enter your card details",
            "Complete secure authorization",
            "Your subscription activates",
          ];


  return (
      <main
        className="relative min-h-screen overflow-hidden bg-[#07091b] px-5 py-8 text-white sm:px-10"
        style={authBackground}
      >
        <DeferredToaster richColors position="bottom-right" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.025),transparent_42%)]" />
        <header className="relative z-10 flex items-center gap-2">
          <img
            src={ASSETS.logo}
            alt="StreamFlix"
            width={256}
            height={256}
            loading="eager"
            decoding="async"
            className="h-12 w-12 object-contain"
          />
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-xl font-black tracking-tight text-transparent">
            streamflix
          </span>
        </header>

        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-112px)] w-full max-w-5xl flex-col justify-center py-10">
          <div className="text-center">
            <Badge className="border-violet-400/25 bg-violet-500/15 text-violet-200">
              Step 3 of 4
            </Badge>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              Complete your subscription
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Choose a payment method and complete the secure prototype
              checkout for your {chosenPlan.name} plan.
            </p>
          </div>

          <div className="mt-9 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setProcessingPayment(true);
                window.setTimeout(() => {
                  setSubscriptionReceipt({
                    id: `SF-SUB-${Date.now().toString().slice(-8)}`,
                    planId: chosenPlan.id,
                    amount: chosenPlan.price,
                    paymentMethod:
                      paymentMethod === "gcash" ? "GCash" : "Card",
                    createdAt: new Date().toISOString(),
                    status: "Completed",
                  });
                  setProcessingPayment(false);
                }, 650);
              }}
              className="rounded-3xl border border-white/10 bg-[#090d20]/85 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300">
                    Payment method
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">How will you pay?</h2>
                </div>
                <ShieldCheck className="size-7 text-emerald-300" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("gcash")}
                  aria-pressed={paymentMethod === "gcash"}
                  className={`rounded-2xl border p-4 text-left transition ${paymentMethod === "gcash" ? "border-violet-400 bg-violet-500/15" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                >
                  <Smartphone className="size-5 text-violet-300" />
                  <span className="mt-3 block font-bold">GCash</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Mobile wallet
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  aria-pressed={paymentMethod === "card"}
                  className={`rounded-2xl border p-4 text-left transition ${paymentMethod === "card" ? "border-violet-400 bg-violet-500/15" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                >
                  <CreditCard className="size-5 text-violet-300" />
                  <span className="mt-3 block font-bold">Credit / Debit Card</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Visa or Mastercard
                  </span>
                </button>
              </div>

              {paymentMethod === "gcash" ? (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-200">
                    GCash mobile number
                    <Input
                      required
                      inputMode="numeric"
                      autoComplete="tel"
                      value={gcashNumber}
                      onChange={(event) => setGcashNumber(event.target.value)}
                      placeholder="09XX XXX XXXX"
                      minLength={11}
                      maxLength={13}
                      className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500"
                    />
                  </label>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    You will be asked to approve the payment in the GCash app.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <label className="block text-sm font-medium text-slate-200">
                    Name on card
                    <Input
                      required
                      autoComplete="cc-name"
                      value={cardholderName}
                      onChange={(event) =>
                        setCardholderName(event.target.value)
                      }
                      placeholder="Cardholder name"
                      className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-200">
                    Card number
                    <Input
                      required
                      inputMode="numeric"
                      autoComplete="cc-number"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="1234 5678 9012 3456"
                      minLength={15}
                      maxLength={19}
                      className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block text-sm font-medium text-slate-200">
                      Expiry
                      <Input
                        required
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        value={cardExpiry}
                        onChange={(event) => setCardExpiry(event.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="mt-2 h-12 border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500"
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-200">
                      CVC
                      <Input
                        required
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        value={cardCvc}
                        onChange={(event) => setCardCvc(event.target.value)}
                        placeholder="123"
                        minLength={3}
                        maxLength={4}
                        className="mt-2 h-12 border-white/10 bg-white/0.06 text-white placeholder:text-slate-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={processingPayment}
                className="mt-7 h-12 w-full bg-linear-to-r from-blue-600 to-violet-600 text-base font-bold text-white hover:from-blue-500 hover:to-violet-500"
              >
                {processingPayment
                  ? "Processing secure payment…"
                  : `Pay ₱${chosenPlan.price} with ${paymentMethod === "gcash" ? "GCash" : "Card"}`}
              </Button>
              <p className="mt-4 text-center text-[11px] leading-5 text-slate-600">
                Prototype checkout only. No real charge is made and payment
                details are not transmitted.
              </p>
            </form>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-[#090d20]/75 p-6 backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  Order summary
                </p>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{chosenPlan.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {chosenPlan.quality} • {chosenPlan.memberText}
                    </p>
                  </div>
                  <p className="text-2xl font-black">₱{chosenPlan.price}</p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-5">
                  <span className="text-sm text-slate-400">Due today</span>
                  <span className="text-lg font-bold">₱{chosenPlan.price}</span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#090d20]/75 p-6 backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  Payment process
                </p>
                <ol className="mt-5 space-y-4">
                  {processSteps.map((step, index) => (
                    <li key={step} className="flex items-center gap-3 text-sm">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-300">
                        {index + 1}
                      </span>
                      <span className="text-slate-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubscriptionReceipt(null);
                  onBackToPlans();
                }}
                className="w-full text-sm text-slate-500 hover:text-slate-300"
              >
                Back to plan selection
              </button>
            </aside>
          </div>
        </section>
      </main>
    );
}
