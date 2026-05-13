import { cn } from "@/lib/mergeClasses";

type LoadingProps = {
  className?: string;
  fullscreen?: boolean;
};

export const Loading = ({ className, fullscreen = true }: LoadingProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullscreen && "h-screen min-h-[100dvh]",
        className,
      )}
    >
      <div className="w-16 h-16 border-4 border-t-transparent border-green-500 rounded-full animate-spin" />
    </div>
  );
};
