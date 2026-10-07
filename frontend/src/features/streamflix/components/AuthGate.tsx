import AuthFlow from "./AuthFlow";

import type { StreamFlixController } from "../hooks/useStreamFlix";

export default function AuthGate({ state }: { state: StreamFlixController }) {
  const maxProfiles =
    state.plans.find((item) => item.id === state.plan)?.maxMembers ?? 0;

  return (
    <AuthFlow
      stage={state.authStage}
      authBusy={state.authBusy}
      authError={state.authError}
      setAuthError={state.setAuthError}
      registeredName={state.registeredName}
      profiles={state.profiles}
      plans={state.plans}
      currentPlan={state.plan}
      maxProfiles={maxProfiles}
      onLogin={state.login}
      onGoogle={state.loginWithGoogle}
      onRegister={state.register}
      onSelectPlan={state.selectPlan}
      onSubscriptionPaid={state.handleSubscriptionPaid}
      onAddProfile={state.addProfile}
      onDeleteProfile={state.removeProfile}
      onEditProfile={state.editProfile}
      onShowLogin={() => state.setAuthStage("login")}
      onShowRegister={() => state.setAuthStage("register")}
      onBackToPlans={() => state.setAuthStage("plans")}
      onSelectProfile={state.selectProfile}
    />
  );
}