import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/mergeClasses";

type MarkdownProps = {
  value?: string;
  className?: string;
};

export const Markdown = ({ value, className }: MarkdownProps) => {
  return (
    <div
      className={cn(
        "prose prose-slate max-w-none dark:prose-invert",
        "prose-headings:text-foreground prose-p:text-foreground",
        "prose-strong:text-foreground prose-li:text-foreground",
        "prose-a:text-primary hover:prose-a:text-primary/80",
        "prose-code:text-foreground prose-blockquote:text-muted-foreground",
        className,
      )}
    >
      <ReactMarkdown>{value ?? ""}</ReactMarkdown>
    </div>
  );
};
