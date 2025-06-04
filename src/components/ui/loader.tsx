import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: string;
}

export function Loader({ className, size = "text-2xl" }: LoaderProps) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <i 
        className={cn("ri-loader-4-line animate-spin text-muted-foreground", size, className)} 
      />
    </div>
  );
}