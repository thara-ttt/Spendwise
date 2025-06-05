
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  session?: any;
}

const AppLayout = ({ children, session }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className={cn("grid min-h-screen w-full", "lg:grid-cols-[280px_1fr]")}>
        <Sidebar session={session} />
        <div className="flex flex-col">
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
