import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/input/base/Input";

type PasswordInputProps = Omit<React.ComponentPropsWithoutRef<"input">, "type">;

/**
 * Password field with exactly one reveal toggle (PLT-033, standard 030). Microsoft Edge draws its
 * own button; it is hidden in globals.css so only this one shows. The field hides again on submit.
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ id, className, ...props }, forwardedRef) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const innerRef = React.useRef<HTMLInputElement | null>(null);
    const fallbackId = React.useId();
    const inputId = id ?? fallbackId;

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    React.useEffect(() => {
      const form = innerRef.current?.form;
      if (!form) return;
      const hide = () => setIsVisible(false);
      form.addEventListener("submit", hide);
      return () => form.removeEventListener("submit", hide);
    }, []);

    return (
      <div className="relative">
        <Input
          {...props}
          id={inputId}
          ref={setRefs}
          type={isVisible ? "text" : "password"}
          className={className ? `pr-11 ${className}` : "pr-11"}
        />
        <button
          type="button"
          onClick={() => setIsVisible((previous) => !previous)}
          className="absolute inset-y-0 right-0 flex items-center px-3 py-2 text-sm text-muted-foreground"
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={isVisible}
          aria-controls={inputId}
        >
          {isVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
