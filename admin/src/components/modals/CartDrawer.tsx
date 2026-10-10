import { useState } from "react";
import { Check, CircleCheckBig, CreditCard, ShoppingBag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MERCH } from "@/features/streamflix/data";
import type { Transaction } from "@/features/streamflix/types";

export function CartDrawer({
  open,
  onOpenChange,
  items,
  quantities,
  total,
  transactions,
  updateQuantity,
  remove,
  checkout,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: typeof MERCH;
  quantities: Record<string, number>;
  total: number;
  transactions: Transaction[];
  updateQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  checkout: (paymentMethod: string, deliveryMethod: string) => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<
    "GCash" | "Card" | "Cash on Delivery"
  >("GCash");
  const [deliveryMethod, setDeliveryMethod] = useState(
    "Standard Delivery (3-5 days)",
  );
  const [checkoutOptionsOpen, setCheckoutOptionsOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"options" | "payment">("options");
  const [isProcessing, setIsProcessing] = useState(false);
  const [gcashNumber, setGcashNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full border-white/10 bg-[#0a0f23] text-white sm:max-w-md">
        <SheetHeader className="border-b border-white/8 p-6">
          <SheetTitle className="text-xl text-white">
            Merchandise bag
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            Your selected StreamFlix products.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {items.length ? (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3"
              >
                <div className="size-14 overflow-hidden rounded-xl bg-white p-1">
                  <img
                    src={item.image}
                    alt=""
                    width={112}
                    height={112}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-sm text-slate-400">
                    ₱{item.price.toLocaleString()}
                  </p>
                  <div className="mt-2 flex w-fit items-center rounded-full border border-white/10 bg-black/20">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, (quantities[item.id] ?? 1) - 1)}
                      aria-label={`Decrease ${item.name} quantity`}
                      className="grid size-8 place-items-center text-lg text-slate-300 hover:text-white"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold">
                      {quantities[item.id] ?? 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, (quantities[item.id] ?? 1) + 1)}
                      aria-label={`Increase ${item.name} quantity`}
                      className="grid size-8 place-items-center text-lg text-slate-300 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="rounded-full p-2 text-slate-500 hover:bg-white/5 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <ShoppingBag className="mx-auto size-10 text-slate-600" />
              <p className="mt-4 text-slate-400">Your bag is empty.</p>
            </div>
          )}
          {transactions.length > 0 && (
            <section className="pt-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Transactions
              </h3>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <article
                    key={transaction.id}
                    className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <CircleCheckBig className="mt-0.5 size-5 shrink-0 text-emerald-400" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold">Order completed</p>
                          <Badge className="bg-emerald-500/15 text-emerald-300">
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {transaction.id} • {transaction.createdAt}
                        </p>
                        <p className="mt-3 text-sm text-slate-300">
                          {transaction.items
                            .map((item) => `${item.name} ×${item.quantity}`)
                            .join(", ")}
                        </p>
                        <div className="mt-3 space-y-1 text-xs text-slate-400">
                          <p>Payment: {transaction.paymentMethod}</p>
                          <p>Delivery: {transaction.deliveryMethod}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3 text-sm">
                          <span className="text-slate-400">
                            {transaction.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            )}{" "}
                            item
                            {transaction.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            ) === 1
                              ? ""
                              : "s"}
                          </span>
                          <span className="font-bold">
                            ₱{transaction.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
        <SheetFooter className="border-t border-white/8 p-6">
          <div className="mb-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>₱{total.toLocaleString()}</span>
          </div>
          <Button
            disabled={!items.length}
            onClick={() => {
              setCheckoutStep("options");
              setCheckoutOptionsOpen(true);
            }}
            className="w-full bg-violet-600 text-white"
          >
            <CreditCard /> Checkout
          </Button>
        </SheetFooter>
        </SheetContent>
      </Sheet>
      <Dialog open={checkoutOptionsOpen} onOpenChange={setCheckoutOptionsOpen}>
        <DialogContent className="border-white/10 bg-[#0c1127] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {checkoutStep === "options" ? "Complete checkout" : `Pay with ${paymentMethod}`}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {checkoutStep === "options"
                ? "Choose how you want to pay and receive your order."
                : paymentMethod === "Cash on Delivery"
                  ? "Review the payment-on-arrival process and place your order."
                  : "Enter your payment details to securely complete this prototype order."}
            </DialogDescription>
          </DialogHeader>
          {checkoutStep === "options" ? (
            <>
              <div className="space-y-6 py-2">
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Payment method
                  </h3>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) =>
                      setPaymentMethod(value as "GCash" | "Card" | "Cash on Delivery")
                    }
                    className="space-y-2"
                  >
                    {["GCash", "Card", "Cash on Delivery"].map((method) => (
                      <label
                        key={method}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 text-sm"
                      >
                        <RadioGroupItem value={method} />
                        <span>{method === "Card" ? "Credit / Debit Card" : method}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </section>
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Delivery method
                  </h3>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={setDeliveryMethod}
                    className="space-y-2"
                  >
                    {["Standard Delivery (3-5 days)", "Store Pickup"].map((method) => (
                      <label
                        key={method}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 text-sm"
                      >
                        <RadioGroupItem value={method} />
                        <span>{method}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </section>
                <div className="flex items-center justify-between border-t border-white/10 pt-4 font-semibold">
                  <span>Total</span>
                  <span>₱{total.toLocaleString()}</span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setCheckoutStep("payment")}
                  className="w-full bg-violet-600 text-white"
                >
                  {paymentMethod === "Cash on Delivery"
                    ? "Continue to order"
                    : "Continue to payment"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-5 py-2">
                {paymentMethod === "GCash" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="merch-gcash-number">
                      GCash mobile number
                    </label>
                    <Input
                      id="merch-gcash-number"
                      value={gcashNumber}
                      onChange={(event) => setGcashNumber(event.target.value.replace(/\D/g, "").slice(0, 11))}
                      placeholder="09XX XXX XXXX"
                      inputMode="numeric"
                      className="border-white/10 bg-white/[0.04]"
                    />
                  </div>
                ) : paymentMethod === "Card" ? (
                  <div className="space-y-3">
                    <Input
                      value={cardName}
                      onChange={(event) => setCardName(event.target.value)}
                      placeholder="Name on card"
                      className="border-white/10 bg-white/[0.04]"
                    />
                    <Input
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value.replace(/\D/g, "").slice(0, 16))}
                      placeholder="Card number"
                      inputMode="numeric"
                      className="border-white/10 bg-white/[0.04]"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={cardExpiry}
                        onChange={(event) => setCardExpiry(event.target.value.slice(0, 5))}
                        placeholder="MM/YY"
                        className="border-white/10 bg-white/[0.04]"
                      />
                      <Input
                        value={cardCvv}
                        onChange={(event) => setCardCvv(event.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="CVV"
                        inputMode="numeric"
                        className="border-white/10 bg-white/[0.04]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-sky-400/20 bg-sky-500/[0.07] p-4 text-sm text-slate-300">
                    No upfront payment is required. Prepare the exact amount when your order arrives.
                  </div>
                )}
                <div className="rounded-2xl border border-violet-400/20 bg-violet-500/[0.07] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                    Payment process
                  </p>
                  <ol className="mt-3 space-y-2 text-sm text-slate-300">
                    <li>1. Verify your payment details.</li>
                    <li>
                      2. {paymentMethod === "GCash"
                        ? "Approve the request in GCash."
                        : paymentMethod === "Card"
                          ? "Authorize the card transaction."
                          : "Confirm the delivery address and payment on arrival."}
                    </li>
                    <li>3. Receive your order confirmation and transaction ID.</li>
                  </ol>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4 font-semibold">
                  <span>Total</span>
                  <span>₱{total.toLocaleString()}</span>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCheckoutStep("options")}
                  disabled={isProcessing}
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  Back
                </Button>
                <Button
                  disabled={
                    isProcessing ||
                    (paymentMethod === "GCash"
                      ? gcashNumber.length !== 11
                      : paymentMethod === "Card"
                        ? !cardName || cardNumber.length < 16 || cardExpiry.length < 4 || cardCvv.length < 3
                        : false)
                  }
                  onClick={async () => {
                    setIsProcessing(true);
                    await new Promise((resolve) => window.setTimeout(resolve, 900));
                    checkout(paymentMethod, deliveryMethod);
                    setIsProcessing(false);
                    setCheckoutOptionsOpen(false);
                    setCheckoutStep("options");
                  }}
                  className="flex-1 bg-violet-600 text-white"
                >
                  <CreditCard /> {isProcessing
                    ? "Processing order…"
                    : paymentMethod === "Cash on Delivery"
                      ? "Place order"
                      : `Pay ₱${total.toLocaleString()}`}
                </Button>
              </DialogFooter>
              <p className="text-center text-[11px] text-slate-600">
                Prototype checkout only. No real charge is made.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
