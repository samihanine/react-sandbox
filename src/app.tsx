import { ListTodoIcon, SheetIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Example } from "@/pages/example";
import { ExcelViewer } from "@/pages/excel-viewer";

const tabs = [
  { value: "excel", label: "Excel viewer", icon: SheetIcon, page: ExcelViewer },
  { value: "example", label: "Todo", icon: ListTodoIcon, page: Example },
];

export function App() {
  return (
    <Tabs defaultValue="excel" className="mx-auto max-w-7xl gap-6 p-4 sm:p-6">
      <header className="flex items-center gap-3">
        <TabsList className="h-12! flex-1 sm:flex-none">
          {tabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="px-4 text-base">
              <Icon /> {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      {tabs.map(({ value, page: Page }) => (
        <TabsContent key={value} value={value} keepMounted>
          <Page />
        </TabsContent>
      ))}
      <Toaster richColors />
    </Tabs>
  );
}
