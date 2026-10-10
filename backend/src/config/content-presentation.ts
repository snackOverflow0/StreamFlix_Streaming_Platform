export type ContentPresentation = {
  poster_url: string | null;
  preview_url: string | null;
  hero_url: string | null;
  duration_label: string | null;
  is_featured?: boolean;
};

const byTitle: Record<string, ContentPresentation> = {
  "Dune: Part Two": { poster_url: "/streamflix/titles/dune-part-two-poster-optimized.webp", preview_url: "/streamflix/titles/dune-part-two-preview-optimized.webp", hero_url: null, duration_label: "2h 46m" },
  "Interstellar": { poster_url: "/streamflix/titles/interstellar-poster-optimized.webp", preview_url: "/streamflix/titles/interstellar-preview-optimized.webp", hero_url: null, duration_label: "2h 36m" },
  "The Fall Guy": { poster_url: "/streamflix/titles/the-fall-guy-poster-optimized.webp", preview_url: "/streamflix/titles/the-fall-guy-preview-optimized.webp", hero_url: null, duration_label: "1h 54m" },
  "The Godfather": { poster_url: "/streamflix/titles/the-godfather-poster-optimized.webp", preview_url: "/streamflix/titles/the-godfather-preview-optimized.webp", hero_url: null, duration_label: "2h 55m" },
  "Stranger Things": { poster_url: "/streamflix/titles/stranger-things-poster-optimized.webp", preview_url: "/streamflix/titles/stranger-things-preview-optimized.webp", hero_url: null, duration_label: "4 seasons" },
  "The Witcher": { poster_url: "/streamflix/titles/the-witcher-poster-optimized.webp", preview_url: "/streamflix/titles/the-witcher-preview-optimized.webp", hero_url: null, duration_label: "3 seasons" },
  "Batman: The Dark Knight Trilogy": { poster_url: "/streamflix/titles/batman-dark-knight-trilogy-poster-optimized.webp", preview_url: "/streamflix/titles/batman-dark-knight-trilogy-preview-optimized.webp", hero_url: null, duration_label: "1 season" },
  "Avengers: Endgame": { poster_url: "/streamflix/titles/avengers-endgame-poster-optimized.webp", preview_url: "/streamflix/titles/avengers-endgame-preview-optimized.webp", hero_url: null, duration_label: "2h 30m" },
  "Deadpool": { poster_url: "/streamflix/titles/deadpool-poster-optimized.webp", preview_url: "/streamflix/titles/deadpool-preview.webp", hero_url: null, duration_label: "1h 48m" },
  "Friday": { poster_url: "/streamflix/titles/friday-poster-optimized.webp", preview_url: "/streamflix/titles/friday-preview-optimized.webp", hero_url: null, duration_label: "1h 31m" },
  "The Conjuring: Last Rites": { poster_url: "/streamflix/titles/conjuring-last-rites.webp", preview_url: "/streamflix/titles/conjuring-last-rites-preview-optimized.webp", hero_url: null, duration_label: "2h 15m" },
  "Spider-Man: Brand New Day": { poster_url: "/streamflix/titles/spider-man-brand-new-day-poster-optimized.webp", preview_url: "/streamflix/titles/spider-man-brand-new-day-preview.webp", hero_url: null, duration_label: "Coming 2026" },
  "Bridgerton": { poster_url: "/streamflix/titles/bridgerton-poster-optimized.webp", preview_url: "/streamflix/titles/bridgerton-preview-optimized.webp", hero_url: null, duration_label: "4 seasons" },
  "Pride & Prejudice": { poster_url: "/streamflix/titles/pride-and-prejudice-poster-optimized.webp", preview_url: "/streamflix/titles/pride-and-prejudice-preview-optimized.webp", hero_url: null, duration_label: "2h 9m" },
  "White Chicks": { poster_url: "/streamflix/titles/white-chicks-poster-optimized.webp", preview_url: "/streamflix/titles/white-chicks-preview-optimized.webp", hero_url: null, duration_label: "1h 49m" },
  "The Walking Dead": { poster_url: "/streamflix/titles/the-walking-dead-poster-optimized.webp", preview_url: "/streamflix/titles/the-walking-dead-preview-optimized.webp", hero_url: null, duration_label: "11 seasons" },
  "House of the Dragon": { poster_url: "/streamflix/titles/house-of-the-dragon-poster-optimized.webp", preview_url: "/streamflix/titles/house-of-the-dragon-preview.webp", hero_url: null, duration_label: "2 seasons" },
  "John Wick: Chapter 4": { poster_url: "/streamflix/titles/john-wick-chapter-4-poster-optimized.webp", preview_url: "/streamflix/titles/john-wick-chapter-4-preview-optimized.webp", hero_url: null, duration_label: "2h 49m" },
  "The Notebook": { poster_url: "/streamflix/titles/the-notebook-poster-optimized.webp", preview_url: "/streamflix/titles/the-notebook-preview-optimized.webp", hero_url: null, duration_label: "2h 3m" },
  "Mean Girls": { poster_url: "/streamflix/titles/mean-girls-poster-optimized.webp", preview_url: "/streamflix/titles/mean-girls-preview.webp", hero_url: null, duration_label: "1h 37m" },
  "Obsession": { poster_url: "/streamflix/titles/obsession-poster-optimized.webp", preview_url: "/streamflix/titles/obsession-preview-optimized.webp", hero_url: null, duration_label: "Feature film" },
  "Mickey 17": { poster_url: "/streamflix/titles/mickey-17-poster-optimized.webp", preview_url: "/streamflix/titles/mickey-17-preview-optimized.webp", hero_url: "/streamflix/titles/mickey-17.jpg", duration_label: "2h 17m", is_featured: true },
  "Project Hail Mary": { poster_url: "/streamflix/titles/project-hail-mary.webp", preview_url: "/streamflix/titles/project-hail-mary-preview.webp", hero_url: null, duration_label: "2h 35m" },
  "Minions & Monsters": { poster_url: "/streamflix/titles/minions-and-monsters.webp", preview_url: "/streamflix/titles/minions-and-monsters-preview.webp", hero_url: null, duration_label: "1h 28m" },
  "Toy Story 5": { poster_url: "/streamflix/titles/toy-story-5.webp", preview_url: "/streamflix/titles/toy-story-5-preview.webp", hero_url: null, duration_label: "1h 42m" },
  "The Odyssey": { poster_url: "/streamflix/titles/the-odyssey.webp", preview_url: "/streamflix/titles/the-odyssey-preview.webp", hero_url: null, duration_label: "2h 48m" },
  "Insidious: Out of the Further": { poster_url: "/streamflix/titles/insidious-out-of-the-further-preview.webp", preview_url: "/streamflix/titles/insidious-out-of-the-further-preview.webp", hero_url: null, duration_label: "Coming 2026" },
};

const fallback: ContentPresentation = { poster_url: null, preview_url: null, hero_url: null, duration_label: null };

export function getContentPresentation(title: string): ContentPresentation {
  const aliases: Record<string, string> = { "Batman: Dark Knight Trilogy": "Batman: The Dark Knight Trilogy", "Conjuring: Last Rites": "The Conjuring: Last Rites" };
  const normalized = title.trim();
  return byTitle[aliases[normalized] ?? normalized] ?? fallback;
}
