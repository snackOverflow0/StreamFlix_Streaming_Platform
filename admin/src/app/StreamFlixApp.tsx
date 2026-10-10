import { AuthPage } from "@/pages";
import { useStreamFlix } from "@/features/streamflix/hooks/useStreamFlix";
import AppLayout from "./AppLayout";

export default function StreamFlixApp() {
  const state = useStreamFlix();

  if (state.authStage !== "app") return <AuthPage state={state} />;
  return <AppLayout state={state} />;
}
