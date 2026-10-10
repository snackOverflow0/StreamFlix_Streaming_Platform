import AuthFlow from "@/pages/auth/AuthFlow";
import { PLANS } from "@/features/streamflix/data";
import { safeStorage } from "@/lib/storage";
import type { StreamFlixController } from "@/features/streamflix/hooks/useStreamFlix";

type AuthGateProps = {
  state: StreamFlixController;
};

export default function AuthGate({ state }: AuthGateProps) {
  const {
    authStage,
    setAuthStage,
    registeredName,
    setRegisteredName,
    account,
    setAccount,
    profiles,
    plan,
    setPlan,
    setNotifications,
    selectProfile,
    addProfile,
    removeProfile,
  } = state;

  return (
    <AuthFlow
      stage={authStage}
      registeredName={registeredName}
      onLogin={() => setAuthStage("profiles")}
      profiles={profiles}
      onAddProfile={addProfile}
      onDeleteProfile={(profile) => void removeProfile(profile)}
      onRegister={(details) => {
        setRegisteredName(details.name);
        setAccount(details);
        setAuthStage("plans");
      }}
      currentPlan={plan}
      onSelectPlan={(id) => {
        setPlan(id);
        safeStorage.setItem("streamflix-plan", id);
        setAuthStage("subscription-payment");
      }}
      onBackToPlans={() => setAuthStage("plans")}
      onSubscriptionPaid={(receipt) => {
        setNotifications((items) => [
          {
            id: `subscription-${receipt.id}`,
            title: "Subscription activated",
            message: `${PLANS.find((item) => item.id === receipt.planId)?.name ?? "StreamFlix"} plan paid via ${receipt.paymentMethod}.`,
            time: "Just now",
            unread: true,
          },
          ...items,
        ]);
        setAuthStage("profiles");
      }}
      onShowLogin={() => setAuthStage("login")}
      onShowRegister={() => setAuthStage("register")}
      onSelectProfile={selectProfile}
    />
  );
}
