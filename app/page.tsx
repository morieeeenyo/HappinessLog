import { CoupleBucketListApp } from "@/components/CoupleBucketListApp";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xl font-bold text-ink">Futari List</p>
      </header>

      <CoupleBucketListApp />
    </div>
  );
}
