# 🎮 GameShelf 
Site de découverte de jeux vidéo permettant de **parcourir un catalogue**, se constituer une **bibliothèque personnelle** (à jouer / en cours / terminé), **noter et commenter** ses jeux, et suivre ses **statistiques** de type de jeux.


---

## 🔗 Liens

| Ressource | URL |
|---|---|
| Application déployée | https://bestgameslibrary.vercel.app/ |
| Dépôt Git | https://github.com/Kebabu27/Game_Shelf |
| API utilisée | [RAWG Video Games Database](https://rawg.io/apidocs) |

---

## ✨ Fonctionnalités

### Navigation
- 4+ pages distinctes via le routeur (Catalogue, Détail, Bibliothèque, Statistiques).
- Accès au détail d'un jeu à partir d'un identifiant (`slug`) présent dans l'URL.
- Chargement rapide du premier rendu : les écrans secondaires sont chargés en différé (lazy loading des routes).
- Page **Statistiques** protégée : redirection si la bibliothèque personnelle est vide.

### Explorer le catalogue
- **Scroll infini** alimenté par l'API RAWG (cartes squelettes pendant le chargement).
- Recherche par mot-clé **fluide** (anti-rebond / debounce, pas de requête à chaque frappe).
- **Filtres avancés** : genre, plateforme, score Metacritic, et tri (tendances, note, date…).
- Annulation de la requête en cours (`AbortController`) lors d'une nouvelle recherche ou d'un changement de filtre.
- Filtrage qualité : le spam et les jeux hors périmètre (titres chinois / coréens) sont écartés.

### Expérience personnelle
- Ajout / retrait d'un jeu de la bibliothèque personnelle.
- Note, statut (à jouer / en cours / terminé) et commentaire par jeu.
- État reflété **partout** : un jeu déjà ajouté est marqué comme tel dans le catalogue.
- **Authentification** (Supabase) : la bibliothèque est liée au compte et **synchronisée dans le cloud**, accessible depuis n'importe quel appareil. Repli `localStorage` quand l'auth n'est pas configurée.
- Consultation libre ; **connexion requise** pour ajouter, noter ou commenter.

### Avis communautaires
- **Avis publics** par jeu (note + texte), **visibles par tous**, avec **fil de commentaires** sous chaque avis.
- Page **Reviews** : fil global des derniers avis tous jeux confondus.
- Chaque utilisateur édite/supprime uniquement ses propres avis et commentaires (**RLS**).
- Pseudo public choisi à l'inscription : l'email n'est **jamais** exposé.

### Informations dérivées
- Page de synthèse agrégeant les données de la bibliothèque : totaux par statut, note moyenne, répartition par genre, top N.
- Agrégats recalculés **automatiquement** dès qu'un jeu est ajouté, retiré ou modifié.

---

## 🧱 Stack technique

| Brique | Choix | Rôle |
|---|---|---|
| Framework | **Vue 3** (`<script setup>`) | SPA, composants |
| Langage | **TypeScript** | Typage statique des entités, props, retours d'API |
| Build | **Vite** | Dev server + build de production |
| Routing | **Vue Router** | Pages, route de détail par `id`, lazy loading, guards |
| État centralisé | **Pinia** | Bibliothèque partagée entre pages, agrégats réactifs |
| Auth & cloud | **Supabase** | Authentification + synchro de la bibliothèque (avec RLS) |
| Persistance | **localStorage** | Cache local / repli sans serveur |
| Requêtes | **fetch + AbortController** | Appels API, annulation |
| Tests | **Vitest + Vue Test Utils** | Tests unitaires & composants |
| Qualité | **ESLint + Prettier** | Lint, formatage |
| Déploiement | **Netlify / Vercel** | Hébergement public |

---

## 🏗️ Architecture

```
src/
├── api/             # Client RAWG (fetch typé, AbortController)
├── components/      # Composants réutilisables (GameCard, SearchBar, RatingInput, FilterBar, StatWidget, BaseModal)
├── composables/     # Logique réutilisable (useDebounce, useFetch...)
├── stores/          # Pinia : library, catalog
├── types/           # Interfaces métier (Game, LibraryEntry, RawgResponse)
├── views/           # Pages (CatalogView, GameDetailView, LibraryView, StatsView, NotFoundView)
├── router/          # Définition des routes + guards
└── main.ts
```

### Pages

| Route | Page | Description |
|---|---|---|
| `/` | Catalogue | Liste paginée, recherche debounced, filtres, tri |
| `/game/:slug` | Détail | Fiche complète d'un jeu depuis l'URL, ajout/note/statut |
| `/library` | Bibliothèque | Liste personnelle filtrable par statut |
| `/reviews` | Avis | Fil communautaire des derniers avis publics |
| `/stats` | Statistiques | Agrégats (protégée si bibliothèque vide) |
| `/*` | NotFound | Page 404 |


## 🚀 Installation & lancement

### Prérequis
- Node.js ≥ 18
- Une clé API RAWG gratuite : https://rawg.io/apidocs

### Mise en route

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# renseigner VITE_RAWG_KEY (obligatoire) et, pour l'auth, les variables Supabase

# 3. Lancer en développement
npm run dev

# 4. Build de production
npm run build

# 5. Prévisualiser le build
npm run preview
```

### Scripts disponibles

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation du build |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run test:coverage` | Tests + rapport de couverture |
| `npm run lint` | Analyse ESLint |

---

## 🔐 Variables d'environnement

Voir [`.env.example`](.env.example). Les clés ne sont **jamais** committées (`.env` est ignoré par Git).

| Variable | Requis | Description |
|---|---|---|
| `VITE_RAWG_KEY` | ✅ | Clé API RAWG (catalogue) |
| `VITE_RAWG_BASE_URL` | — | Base de l'API RAWG (valeur par défaut fournie) |
| `VITE_SUPABASE_URL` | optionnel | URL du projet Supabase (auth + synchro) |
| `VITE_SUPABASE_ANON_KEY` | optionnel | Clé publique (`anon` / `publishable`) Supabase |

> Si les deux variables Supabase sont absentes, l'authentification est **désactivée** et la bibliothèque retombe sur `localStorage`. En production (Vercel), ces variables doivent être définies sur l'environnement **Production**.

---

## 🔑 Authentification (Supabase)

L'inscription / connexion par email + mot de passe et la synchronisation de la bibliothèque s'appuient sur [Supabase](https://supabase.com).

### Mise en place
1. Créer un projet gratuit sur supabase.com.
2. Récupérer **Project URL** et la clé **anon / publishable** (Project Settings → API) et les mettre dans `.env`.
3. Exécuter ce SQL dans **SQL Editor** pour créer la table de bibliothèque sécurisée par RLS :

```sql
create table public.user_libraries (
  user_id uuid primary key references auth.users on delete cascade,
  entries jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

alter table public.user_libraries enable row level security;

create policy "own library select" on public.user_libraries
  for select using (auth.uid() = user_id);
create policy "own library insert" on public.user_libraries
  for insert with check (auth.uid() = user_id);
create policy "own library update" on public.user_libraries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

4. Exécuter ce SQL pour les **avis publics et commentaires** (lecture publique, écriture limitée à l'auteur) :

```sql
-- Avis : un par utilisateur et par jeu (upsert).
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  author_name text not null,
  game_id integer not null,
  game_slug text not null,
  game_name text not null,
  rating smallint not null check (rating between 1 and 5),
  body text not null,
  created_at timestamptz not null default now(),
  unique (user_id, game_id)
);

-- Commentaires sous un avis.
create table public.review_comments (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;
alter table public.review_comments enable row level security;

-- Lecture publique, écriture/suppression réservées à l'auteur.
create policy "reviews public read" on public.reviews for select using (true);
create policy "reviews own write" on public.reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "comments public read" on public.review_comments for select using (true);
create policy "comments own write" on public.review_comments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

## 🤖 Utilisation de l'IA

Conformément à la consigne, l'usage de l'IA est déclaré. Un assistant IA a été utilisé en appui du développement, principalement pour du débogage, des explications et de la relecture. Les choix d'architecture, l'implémentation, la validation et les tests ont été pilotés et compris par le développeur.

---

## 👥 Auteur

| Nom | Rôle |
|---|---|
| Kebabu27 ([GitHub](https://github.com/Kebabu27)) | Développement (projet réalisé en solo) |

