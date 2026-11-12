import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"i">) {
  return (
    <i
      role="status"
      aria-label="Loading"
      className={cn("bx bx-loader-alt animate-spin text-base", className)}
      {...props}
    />
  );
}

export { Spinner };
