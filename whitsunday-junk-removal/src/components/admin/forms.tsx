"use client";

import { useActionState, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import type { ActionResult } from "@/lib/types";

type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/**
 * Form wired to a server action. Submits via onSubmit (not the action prop) so
 * React doesn't wipe the inputs when the server sends back a validation error.
 */
export function ActionForm({
  action,
  children,
  className = "",
  submitLabel = "Save",
  submitClassName = "btn btn-primary",
  extraButtons,
  hideSubmit = false,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  submitLabel?: ReactNode;
  submitClassName?: string;
  extraButtons?: ReactNode;
  hideSubmit?: boolean;
}) {
  const [state, dispatch, pending] = useActionState(action, undefined);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        if (submitter?.name) fd.set(submitter.name, submitter.value);
        startTransition(() => dispatch(fd));
      }}
    >
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
      {state?.error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="mt-4 rounded-lg border border-teal-700/30 bg-teal-50 px-3 py-2 text-sm text-teal-800">
          {state.ok}
        </p>
      )}
      {!hideSubmit && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="submit" className={submitClassName} disabled={pending}>
            {pending ? "Saving…" : submitLabel}
          </button>
          {extraButtons}
        </div>
      )}
    </form>
  );
}

/** One-click server action button with an optional confirm prompt. */
export function ActionButton({
  action,
  children,
  confirm: confirmText,
  className = "btn btn-ghost btn-sm",
  fields = {},
}: {
  action: Action;
  children: ReactNode;
  confirm?: string;
  className?: string;
  fields?: Record<string, string>;
}) {
  const [state, dispatch, pending] = useActionState(action, undefined);
  const [, startTransition] = useTransition();
  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        className={className}
        disabled={pending}
        onClick={() => {
          if (confirmText && !window.confirm(confirmText)) return;
          const fd = new FormData();
          for (const [k, v] of Object.entries(fields)) fd.set(k, v);
          startTransition(() => dispatch(fd));
        }}
      >
        {pending ? "Working…" : children}
      </button>
      {state?.error && <span className="mt-1 text-xs text-red-700">{state.error}</span>}
    </span>
  );
}

/** Collapsible panel for secondary forms (record payment, add payout…). */
export function Disclosure({ label, children, defaultOpen = false, buttonClassName = "btn btn-ghost btn-sm" }: { label: ReactNode; children: ReactNode; defaultOpen?: boolean; buttonClassName?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      {!open && (
        <button type="button" className={buttonClassName} onClick={() => setOpen(true)}>
          {label}
        </button>
      )}
      {open && (
        <div className="rounded-xl border border-teal-700/30 bg-paper p-4">
          {children}
          <button type="button" className="mt-3 text-xs text-slate-500 hover:text-ocean" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
