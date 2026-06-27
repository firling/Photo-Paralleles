"use server";

/**
 * Contact form submission.
 *
 * Placeholder for this increment: wiring transactional email (Resend) to the
 * association inbox is a later increment. For now we log the payload server-side
 * so the form is functional end-to-end without sending anything.
 */
export async function submitContact(formData: FormData) {
  const payload = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  // TODO (later increment): send via Resend to the association contact email.
  console.info("[contact] message reçu (non envoyé) :", payload);
}
