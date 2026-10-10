import LoginPage from "./LoginPage";
import PlanSelectionPage from "./PlanSelectionPage";
import SubscriptionPaymentPage from "./SubscriptionPaymentPage";
import ProfileSelectionPage from "./ProfileSelectionPage";
import type { AuthStage, RegisteredAccount, SubscriptionReceipt, ViewerProfile } from "@/features/streamflix/types";

type NewProfile = {
  name: string;
  deviceType: string;
  deviceName: string;
  avatarUrl: string;
};

type AuthFlowProps = {
  stage: AuthStage;
  registeredName: string;
  profiles: ViewerProfile[];
  onAddProfile: (profile: NewProfile) => void;
  onDeleteProfile: (profile: ViewerProfile) => void;
  onLogin: () => void;
  onRegister: (details: RegisteredAccount) => void;
  currentPlan: string;
  onSelectPlan: (id: string) => void;
  onBackToPlans: () => void;
  onSubscriptionPaid: (receipt: SubscriptionReceipt) => void;
  onShowLogin: () => void;
  onShowRegister: () => void;
  onSelectProfile: (profile: ViewerProfile) => void;
};

export default function AuthFlow(props: AuthFlowProps) {
  switch (props.stage) {
    case "login":
    case "register":
      return <LoginPage {...props} stage={props.stage} />;
    case "plans":
      return (
        <PlanSelectionPage
          currentPlan={props.currentPlan}
          onSelectPlan={props.onSelectPlan}
          onBackToRegistration={props.onShowRegister}
        />
      );
    case "subscription-payment":
      return (
        <SubscriptionPaymentPage
          currentPlan={props.currentPlan}
          onBackToPlans={props.onBackToPlans}
          onSubscriptionPaid={props.onSubscriptionPaid}
        />
      );
    case "profiles":
      return (
        <ProfileSelectionPage
          registeredName={props.registeredName}
          profiles={props.profiles}
          onAddProfile={props.onAddProfile}
          onDeleteProfile={props.onDeleteProfile}
          onSelectProfile={props.onSelectProfile}
          onShowLogin={props.onShowLogin}
        />
      );
    case "app":
      return null;
  }
}
