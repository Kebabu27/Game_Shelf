/** Statut de progression d'un jeu dans la bibliothèque personnelle. */
export type GameStatus = 'backlog' | 'playing' | 'done'

/** Entité nommée générique de RAWG (genre, tag, studio, éditeur…). */
export interface NamedEntity {
  id: number
  name: string
  slug: string
}

/** Genre tel que renvoyé par l'API RAWG. */
export type Genre = NamedEntity

/** Capture d'écran d'un jeu. */
export interface Screenshot {
  id: number
  image: string
  width: number
  height: number
}

/** Bande-annonce vidéo d'un jeu. */
export interface Movie {
  id: number
  name: string
  preview: string
  data: {
    '480'?: string
    max?: string
  }
}

/** Plateforme tel que renvoyée par l'API RAWG (imbriquée). */
export interface PlatformWrapper {
  platform: {
    id: number
    name: string
    slug: string
  }
}

/** Jeu issu du catalogue RAWG (vue liste + détail). */
export interface Game {
  id: number
  slug: string
  name: string
  released: string | null
  background_image: string | null
  background_image_additional?: string | null
  rating: number
  metacritic: number | null
  genres: Genre[]
  platforms: PlatformWrapper[]
  parent_platforms?: PlatformWrapper[]
  dominant_color?: string
  // Champs renseignés sur la vue détail.
  description_raw?: string
  playtime?: number
  website?: string
  esrb_rating?: NamedEntity | null
  developers?: NamedEntity[]
  publishers?: NamedEntity[]
  tags?: NamedEntity[]
}

/** Réponse paginée générique de l'API RAWG. */
export interface RawgResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/** Entrée de la bibliothèque personnelle (jeu + métadonnées utilisateur). */
export interface LibraryEntry {
  id: number
  slug: string
  name: string
  background_image: string | null
  genres: Genre[]
  status: GameStatus
  rating: number // note personnelle 0–5
  comment: string
  addedAt: number // timestamp
}

/** Commentaire public posté sous un avis. */
export interface ReviewComment {
  id: string
  review_id: string
  user_id: string
  author_name: string
  body: string
  created_at: string
}

/** Avis public laissé par un utilisateur sur un jeu (visible de tous). */
export interface Review {
  id: string
  user_id: string
  author_name: string
  game_id: number
  game_slug: string
  game_name: string
  rating: number // note 1–5
  body: string
  created_at: string
  // Commentaires imbriqués (jointure Supabase).
  review_comments?: ReviewComment[]
}

/** Critères de recherche/filtre/tri du catalogue. */
export interface CatalogQuery {
  search: string
  genre: string | null
  platform: number | null
  metacritic: string | null
  ordering: string
  page: number
}
