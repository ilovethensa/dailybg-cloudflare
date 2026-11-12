ALTER TABLE posts ADD COLUMN featured INTEGER NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN featured_rank INTEGER;

CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured, featured_rank);
