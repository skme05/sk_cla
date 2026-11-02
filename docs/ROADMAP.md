# Feuille de route

## Fait (étape 1 : les bases)

- [x] Projet Next.js + TypeScript
- [x] Schéma de base de données : foyers, réponses, historique, tables, menu, anti-devinette
- [x] Codes d'invitation générés par la base, sans caractères ambigus
- [x] API de confirmation : recherche par code, enregistrement, limite de 5 erreurs par IP en 15 min, date limite
- [x] Parcours invité : code (pré-rempli par le lien WhatsApp), présence, nombre de personnes, régime, mot, table et plan de salle
- [x] Espace mariés : connexion, statistiques, ajout de foyer, bouton WhatsApp (invitation puis relance), suivi des envois, remplissage des tables
- [x] Tests unitaires et contrôle du schéma SQL

## Étape 2 : le site public tel que la maquette

- [ ] Porter le design et les animations de `docs/maquette.html` : loader « Ouvrir l'invitation », bruit des vagues, soleil couchant, palmiers, pétales, mouettes
- [ ] Animations au défilement, « Notre histoire » horizontale, pirogue, bandeaux défilants
- [ ] Esquisses du lieu, puis vraies photos
- [ ] Menu illustré avec onglets, puis photos du traiteur
- [ ] Effets anime.js : prénoms, mer de points, avion en papier, alliances, emblème
- [ ] Respect de « réduire les animations » et version légère pour petits téléphones

## Étape 3 : espace mariés complet

- [ ] Import de la liste d'invités (Excel / Google Sheets)
- [ ] Modifier / supprimer un foyer, changer sa table
- [ ] Plan de table : créer les tables, glisser-déposer les foyers
- [ ] Gestion du menu et des photos (Supabase Storage)
- [ ] Exports : liste traiteur (couverts, régimes), liste d'accueil triée par table

## Étape 4 : mise en ligne

- [ ] Projet Supabase de production, variables sur Vercel, nom de domaine
- [ ] Test avec 5 à 10 proches
- [ ] Envoi des invitations

## Contenus attendus des mariés

Horaires et lieux précis, texte d'invitation, noms des tables et capacités, liste des invités, photos (couple, lieu, plats), menu du traiteur, numéro WhatsApp de contact, nom de domaine.
