CREATE TABLE IF NOT EXISTS posts (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  pub_date INTEGER NOT NULL,
  updated_date INTEGER,
  category TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  author TEXT,
  hero_image TEXT,
  draft INTEGER NOT NULL DEFAULT 0
);
