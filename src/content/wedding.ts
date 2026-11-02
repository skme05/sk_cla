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
    "Ce site rassemble tout ce qu'il faut savoir. Confirmez votre présence avec le code reçu par WhatsApp avant le 13 janvier 2027 : vous découvrirez votre table.",
  ],
  kicker: "Sous les tropiques, nous nous marions",
  shortDate: "13 · 02 · 2027",
  marquees: [
    ["Gaël & Clarisse", "13 · 02 · 2027", "Grand-Bassam", "Sous les tropiques"],
    ["Pieds dans le sable", "Rouge & bleu nuit", "Golfe de Guinée", "On danse jusqu'au bout de la nuit"],
  ],
  // Notre histoire : les esquisses seront remplacées par des photos (champ photo, chemin dans /public).
  story: [
    { year: "2019", title: "La rencontre", text: "Un mariage d'amis à Abidjan. Une danse, puis une conversation qui ne s'est jamais arrêtée.", sketch: "sk-ville", photo: null },
    { year: "2021", title: "Grand-Bassam, déjà", text: "Notre premier week-end à deux, sur cette plage. Nous ne savions pas encore que nous y reviendrions.", sketch: "sk-plage", photo: null },
    { year: "2025", title: "La demande", text: "Au coucher du soleil, les pieds dans l'eau. Elle a dit oui avant la fin de la question.", sketch: "sk-bague", photo: null },
    { year: "2027", title: "Le grand jour", text: "Le 13 février, face au golfe de Guinée. Et vous serez là.", sketch: "sk-paillote", photo: null },
  ],
  venue: {
    intro: "Ancienne capitale de la Côte d'Ivoire, Grand-Bassam garde son Quartier France, inscrit au patrimoine mondial de l'UNESCO en 2012, posé entre l'océan et la lagune Ouladine. En attendant les vraies photos du lieu, voici quelques esquisses.",
    places: [
      { title: "La plage", text: "La cérémonie, face au golfe de Guinée", sketch: "sk-plage", photo: null },
      { title: "Le Quartier France", text: "Façades coloniales et balcons, pour les photos", sketch: "sk-maison", photo: null },
      { title: "La lagune Ouladine", text: "Mangroves et pirogues de pêcheurs", sketch: "sk-lagune", photo: null },
      { title: "Le phare", text: "Repère de la côte depuis plus d'un siècle", sketch: "sk-phare", photo: null },
      { title: "La paillote", text: "Dîner et soirée dansante", sketch: "sk-paillote", photo: null },
    ],
  },
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
        { time: "20:00", title: "Dîner & soirée dansante", place: "Sous la paillote, jusqu'au bout de la nuit" },
      ],
    },
  ],
  infos: [
    { icon: "tenue", title: "Tenue", text: "Rouge et bleu nuit, tissus légers. Chaussures plates conseillées : la cérémonie se passe sur le sable.", swatches: ["#e0303f", "#0b1533", "#f4e7d0"] },
    { icon: "lieu", title: "Venir & dormir", text: "Grand-Bassam est à 40 min d'Abidjan et à 30 min de l'aéroport Félix-Houphouët-Boigny. Une liste d'hôtels en bord de plage sera partagée." },
    { icon: "cadeau", title: "Cadeaux", text: "Une urne sera à la réception. Contribution possible par Orange Money ou Wave." },
  ],
} as const;

/** Onglets du menu (pluriels), dans l'ordre du repas. */
export const courseTabs = {
  cocktail: "Cocktail",
  starter: "Entrée",
  main: "Plats",
  dessert: "Desserts",
  drinks: "Boissons",
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
