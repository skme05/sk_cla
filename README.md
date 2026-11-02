# Gaël & Clarisse — site du mariage

Site d'invitation au mariage de Gaël et Clarisse, le **samedi 13 février 2027 à Grand-Bassam** (Côte d'Ivoire).

Chaque foyer invité reçoit par WhatsApp un **code à 6 caractères**. Avec ce code, il confirme sa présence sur le site, indique son régime alimentaire et découvre **sa table** sur le plan de la salle.

La maquette validée (animations, loader, esquisses, menu) est dans [`docs/maquette.html`](docs/maquette.html) : ouvrez-la dans un navigateur.

## Technologies

| Rôle | Outil |
|---|---|
| Site et API | Next.js 16 (App Router, TypeScript) |
| Base de données | Supabase (PostgreSQL) |
| Hébergement | Vercel |
| Tests | Vitest + script de contrôle SQL |

## Structure

```
src/
  app/
    page.tsx              Site public : accueil, invitation, programme, menu, infos, confirmation
    api/rsvp/lookup/      POST { code } → foyer, places, réponse, table
    api/rsvp/             POST { code, attending, guestCount, diet, message } → enregistre la réponse
    admin/                Espace mariés (mot de passe) : invités, codes, envoi WhatsApp, tables
  components/Rsvp.tsx     Parcours de confirmation (code → réponse → table)
  content/wedding.ts      Textes, date, programme, infos pratiques
  lib/
    codes.ts              Codes sans caractères ambigus (ni 0/O ni 1/I)
    whatsapp.ts           Messages d'invitation / relance et liens wa.me
    validation.ts         Validation des saisies (zod), numéros ivoiriens par défaut
    session.ts, auth.ts   Session admin signée (cookie httpOnly)
    repo.ts               Accès aux données (clé service_role, côté serveur uniquement)
supabase/
  migrations/             Schéma de la base
  seed.sql                Données d'exemple : 6 tables, 2 foyers de test, menu proposé
scripts/test-db.sh        Vérifie le schéma sur un PostgreSQL local jetable
docs/                     Maquette et feuille de route
```

## Base de données

| Table | Contenu |
|---|---|
| `households` | Foyers invités : nom affiché, téléphone WhatsApp, nombre de places, table, code (généré automatiquement) |
| `rsvps` | Une réponse par foyer : présent ou non, nombre de personnes, régime, mot pour les mariés |
| `rsvp_log` | Historique de chaque réponse (si un invité change d'avis) |
| `seating_tables` | Tables (Hibiscus, Cocotier…), capacité, position sur le plan de salle |
| `menu_items` | Plats par moment (cocktail, entrée, plat, dessert, boissons), étiquettes, photo |
| `code_attempts` | Tentatives de code par IP anonymisée (5 erreurs max en 15 min) |

Vues pour l'espace mariés : `guest_overview` (statut de chaque foyer) et `table_occupancy` (remplissage des tables).

Règles garanties par la base :

- Un code a toujours 6 caractères parmi `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`.
- Une réponse « présent » compte au moins une personne, une réponse « absent » n'en compte aucune.
- Le nombre de personnes ne peut pas dépasser les places du foyer.
- Le RLS est activé partout sans aucune politique : les clés publiques de Supabase n'ont accès à rien. Seul le serveur (clé `service_role`) lit et écrit.

## Mise en route

1. **Créer le projet Supabase** sur [supabase.com](https://supabase.com).
2. **Créer le schéma** : copier `supabase/migrations/20261102120000_init.sql` dans l'éditeur SQL de Supabase et l'exécuter. Ou, avec la CLI Supabase : `supabase link` puis `supabase db push`.
3. **Données d'exemple** (facultatif) : exécuter `supabase/seed.sql`. Codes de test : `K7M4PQ` (Famille Ilunga, 4 places, table Hibiscus) et `TR9X2D` (Esther Kabila, 1 place, table Corail).
4. **Variables d'environnement** : copier `.env.example` en `.env.local` et le remplir.
5. **Lancer le site** :

```bash
npm install
npm run dev        # http://localhost:3000 — espace mariés : /admin
```

## Vérifications

```bash
npm test           # tests unitaires (codes, WhatsApp, validation, session)
npm run typecheck  # TypeScript
npm run db:test    # applique migration + seed sur un PostgreSQL local et vérifie les règles
npm run build      # build de production
```

`npm run db:test` nécessite PostgreSQL installé localement (`initdb`, `pg_ctl`, `psql`).

## Déploiement

Importer le dépôt dans Vercel et y renseigner les mêmes variables d'environnement. Le nom de domaine se branche ensuite dans Vercel.

## Feuille de route

Voir [`docs/ROADMAP.md`](docs/ROADMAP.md).
