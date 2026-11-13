-- Store reading time so listing pages never have to load or parse post bodies.
ALTER TABLE posts ADD COLUMN reading_time INTEGER NOT NULL DEFAULT 1;

-- Backfill an approximation from the body's word count (the runtime recomputes
-- the exact value whenever a post is created or its body changes).
UPDATE posts
SET reading_time = MAX(
  1,
  CAST(ROUND((LENGTH(body) - LENGTH(REPLACE(body, ' ', '')) + 1) / 200.0) AS INTEGER)
);

-- Cover the two hot list queries: published posts newest-first and the
-- featured lineup.
CREATE INDEX IF NOT EXISTS idx_posts_draft_pub_date ON posts(draft, pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured_rank ON posts(featured, featured_rank, pub_date DESC);
