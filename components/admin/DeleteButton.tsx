"use client";

/**
 * Delete control for the catalog edit pages. Renders a small form bound to a
 * server action with a native confirm guard. The record id travels in a hidden
 * input.
 */
export default function DeleteButton({
  action,
  id,
  label,
  confirmMessage,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label: string;
  confirmMessage: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="adm-btn adm-btn--ghost adm-btn--danger adm-btn--sm">
        {label}
      </button>
    </form>
  );
}
