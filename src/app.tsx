import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import { PostersPage } from "@/pages/posters";

export function App() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex justify-end">
        <ThemeToggle />
      </header>
      <main>
        <PostersPage />
      </main>
      <Toaster richColors />
    </div>
  );
}
