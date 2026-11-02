"use client";

import { useEffect } from "react";
import { startSiteMotion } from "@/lib/site-motion";

/** Lance les animations du site public (porté de docs/maquette.html) une fois la page hydratée. */
export function SiteMotion() {
  useEffect(() => startSiteMotion(), []);
  return null;
}
