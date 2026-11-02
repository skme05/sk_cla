import "server-only";
import { NextResponse } from "next/server";

/** Toute erreur inattendue (base injoignable, etc.) devient un message lisible pour l'invité. */
export function withErrors(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (e) {
      console.error(e);
      return NextResponse.json(
        { error: "Le service est momentanément indisponible. Réessayez dans quelques minutes." },
        { status: 503 },
      );
    }
  };
}
