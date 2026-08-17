CREATE TABLE posts_new (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  pub_date INTEGER NOT NULL,
  updated_date INTEGER,
  tags TEXT NOT NULL DEFAULT '[]',
  author TEXT,
  hero_image TEXT,
  draft INTEGER NOT NULL DEFAULT 0
);

INSERT INTO posts_new (slug, title, excerpt, body, pub_date, updated_date, tags, author, hero_image, draft)
  SELECT slug, title, excerpt, body, pub_date, updated_date, tags, author, hero_image, draft FROM posts;

DROP TABLE posts;
ALTER TABLE posts_new RENAME TO posts;
