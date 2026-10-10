import AuthFlow from "./AuthFlow";
import type { StreamFlixController } from "../hooks/useStreamFlix";
export default function AuthGate({ state }: { state: StreamFlixController }) {
  return <AuthFlow stage={state.authStage} authBusy={state.authBusy} authError={state.authError} setAuthError={state.setAuthError} registeredName={state.registeredName} profiles={state.profiles} plans={state.plans} currentPlan={state.plan} onLogin={state.login} onGoogle={state.loginWithGoogle} onRegister={state.register} onSelectPlan={state.selectPlan} onAddProfile={state.addProfile} onDeleteProfile={state.removeProfile} onShowLogin={() => state.setAuthStage("login")} onShowRegister={() => state.setAuthStage("register")} onSelectProfile={state.selectProfile} />;
}
