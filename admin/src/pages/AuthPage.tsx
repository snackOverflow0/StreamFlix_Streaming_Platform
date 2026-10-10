import AuthGate from "@/components/auth/AuthGate";
import type { StreamFlixController } from "@/features/streamflix/hooks/useStreamFlix";

export default function AuthPage({ state }: { state: StreamFlixController }) {
  return <AuthGate state={state} />;
}
