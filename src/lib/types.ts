export type Diet = "none" | "vegetarian" | "no_pork" | "no_seafood" | "allergy";
export type Course = "cocktail" | "starter" | "main" | "dessert" | "drinks";
export type RsvpStatus = "pending" | "attending" | "declined";

export interface SeatingTable {
  id: string;
  name: string;
  capacity: number;
  pos_x: number | null;
  pos_y: number | null;
}

export interface MenuItem {
  id: string;
  course: Course;
  name: string;
  description: string | null;
  tags: string[];
  image_url: string | null;
}

export interface GuestOverview {
  id: string;
  code: string;
  display_name: string;
  phone: string | null;
  seats: number;
  invitation_sent_at: string | null;
  table_name: string | null;
  status: RsvpStatus;
  guest_count: number;
  diet: Diet | null;
  message: string | null;
  responded_at: string | null;
}

/** Ce que l'invité voit après avoir saisi son code. */
export interface GuestView {
  displayName: string;
  seats: number;
  rsvp: { attending: boolean; guestCount: number; diet: Diet; message: string | null } | null;
  /** Nom de la table, seulement si l'invité a confirmé sa présence. */
  table: { name: string; layout: SeatingTable[] } | null;
  deadlinePassed: boolean;
}
