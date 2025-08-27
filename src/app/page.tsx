import { Dashboard } from "@/components/dashboard/Dashboard";

export default function Home() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background overflow-hidden">
      <Dashboard />
    </main>
  );
}
