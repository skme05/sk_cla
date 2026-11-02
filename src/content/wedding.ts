// Contenu éditorial du site. Les horaires et lieux précis sont provisoires.
export const wedding = {
  couple: { first: "Gaël", second: "Clarisse", monogram: "G&C" },
  families: "Les familles de Gaël et de Clarisse",
  date: "2027-02-13T16:30:00Z", // cérémonie face à la mer (Grand-Bassam = UTC+0)
  dateLabel: "Samedi 13 février 2027",
  place: "Grand-Bassam, Côte d'Ivoire",
  rsvpDeadline: "2027-01-13T23:59:59Z",
  rsvpDeadlineLabel: "13 janvier 2027",
  hashtag: "#GaelEtClarisse2027",
  contact: { name: "Gaël", phone: "+225 07 00 00 00 00" },
  invitation: [
    "Nous avons choisi la mer pour nous dire oui : le bruit des vagues, le sable sous les pieds et le soleil qui se couche sur l'Atlantique. Nous voulons vivre ce moment entourés de ceux que nous aimons.",
    "Ce site rassemble tout ce qu'il faut savoir. Confirmez votre présence avec le code reçu par WhatsApp : vous découvrirez votre table.",
  ],
  program: [
    {
      day: "Vendredi 12 février",
      events: [
        { time: "15:00", title: "Remise de la dot", place: "Cérémonie coutumière, villa familiale" },
        { time: "19:30", title: "Dîner des familles", place: "Attiéké-poisson braisé face à la mer" },
      ],
    },
    {
      day: "Samedi 13 février",
      events: [
        { time: "10:00", title: "Mariage civil", place: "Mairie de Grand-Bassam" },
        { time: "16:30", title: "Cérémonie face à la mer", place: "Sur la plage, sous l'arche d'hibiscus", highlight: true },
        { time: "18:30", title: "Coucher du soleil & cocktail", place: "Jus de coco, bissap, photos" },
        { time: "20:00", title: "Dîner & soirée dansante", place: "Sous la paillote" },
      ],
    },
  ],
  infos: [
    { title: "Tenue", text: "Rouge et bleu nuit, tissus légers. Chaussures plates conseillées : la cérémonie se passe sur le sable." },
    { title: "Venir & dormir", text: "Grand-Bassam est à 40 min d'Abidjan et à 30 min de l'aéroport Félix-Houphouët-Boigny." },
    { title: "Cadeaux", text: "Une urne sera à la réception. Contribution possible par Orange Money ou Wave." },
  ],
} as const;

export const courseLabels = {
  cocktail: "Cocktail",
  starter: "Entrée",
  main: "Plat",
  dessert: "Dessert",
  drinks: "Boissons",
} as const;

export const dietLabels = {
  none: "Aucune restriction",
  vegetarian: "Végétarien",
  no_pork: "Sans porc",
  no_seafood: "Sans poisson ni fruits de mer",
  allergy: "Allergie (précisez dans le mot)",
} as const;
