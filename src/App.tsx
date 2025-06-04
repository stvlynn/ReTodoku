import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Router } from "@/router";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <main className="min-h-screen bg-[#F7F5F0] text-[#1F1F1F] font-sans">
        <Router />
      </main>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;