import { Dashboard } from "@/components/dashboard/Dashboard";

export default function Home() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-8 overflow-hidden">
      <Dashboard />
    </main>
  );
}
