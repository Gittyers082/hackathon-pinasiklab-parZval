/** Where a signed-in owner lands. Override with NEXT_PUBLIC_APP_URL. */
export const APP_HOME = process.env.NEXT_PUBLIC_APP_URL ?? '/app/';

export type AuthResult =
  | { ok: true }
  | { ok: false; reason: 'wrong-pin' | 'locked' | 'network' };

/**
 * INTEGRATION POINT. There is no backend yet, so this accepts any well-formed
 * phone number and PIN after a short delay. It does NOT authenticate anyone.
 * Replace the body with a real request; the login screen already handles each
 * failure reason below, including the shake and the message.
 *
 * `phone` is ten national digits (9171234567). `pin` is six digits.
 */
export async function signIn(phone: string, pin: string): Promise<AuthResult> {
  void phone;
  void pin;
  await new Promise((resolve) => setTimeout(resolve, 650));
  return { ok: true };
}

export const AUTH_MESSAGES: Record<Extract<AuthResult, { ok: false }>['reason'], string> = {
  'wrong-pin': 'Hindi tugma ang PIN. Subukan ulit.',
  locked: 'Masyadong maraming subok. Maghintay ng ilang minuto.',
  network: 'Walang koneksyon. Subukan ulit pag may signal.',
};
