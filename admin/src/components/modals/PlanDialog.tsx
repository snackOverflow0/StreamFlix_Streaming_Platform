import { Check, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PLANS } from "@/features/streamflix/data";

export function PlanDialog({
  open,
  onOpenChange,
  current,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: string;
  onSelect: (name: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#0c1127] text-white sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Choose your StreamFlix plan
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            All plans include the full catalog and can be cancelled anytime.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl border p-5 ${current === item.id ? "border-violet-400 bg-violet-500/10" : "border-white/10 bg-white/[0.03]"}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{item.name}</h3>
                {current === item.id && (
                  <Badge className="bg-violet-600">Current</Badge>
                )}
              </div>
              <p className="mt-5 text-3xl font-black">
                ₱{item.price}
                <span className="text-sm font-normal text-slate-400">/mo</span>
              </p>
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <p className="flex gap-2">
                  <Check className="size-4 text-emerald-400" /> {item.quality}{" "}
                  streaming
                </p>
                <p className="flex gap-2">
                  <UsersRound className="size-4 text-violet-300" />{" "}
                  {item.memberText}
                </p>
              </div>
              <Button
                onClick={() => onSelect(item.id)}
                disabled={current === item.id}
                className="mt-6 w-full bg-violet-600 text-white"
              >
                {current === item.id ? "Selected" : `Choose ${item.name}`}
              </Button>
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
