import { mergeClasses } from "@/lib/mergeClasses";

export const Skeleton = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="skeleton"
      className={mergeClasses("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
};
