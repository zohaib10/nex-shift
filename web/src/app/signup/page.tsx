import { SignupContainer } from "./signup.container";
import { GuestGuard } from "@/components/GuestGuard";

export default function SignupPage() {
  return (
    <GuestGuard>
      <SignupContainer />
    </GuestGuard>
  );
}
