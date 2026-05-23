import { CoupleBucketListApp } from "@/components/CoupleBucketListApp";
import { LogoutButton } from "@/components/LogoutButton";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <p className="text-xl font-bold text-ink">Futari List</p>
        <LogoutButton />
      </header>

      <CoupleBucketListApp />
    </div>
  );
}
