ALTER TABLE posts ADD COLUMN category TEXT;

-- Backfill existing rows so every article has one of the canonical sections.
UPDATE posts
SET category = CASE
  WHEN tags LIKE '%Украйна%' OR tags LIKE '%Ukraine%' THEN 'Война в Украйна'
  WHEN tags LIKE '%Иран%' OR tags LIKE '%Iran%' THEN 'Война в Иран'
  WHEN tags LIKE '%България%' OR tags LIKE '%Пожар%' OR tags LIKE '%Времето%' OR tags LIKE '%Кюстендил%' THEN 'България'
  WHEN tags LIKE '%Европа%' OR tags LIKE '%ЕС%' OR tags LIKE '%Europe%' THEN 'Европа'
  WHEN tags LIKE '%Африка%' OR tags LIKE '%Азия%' OR tags LIKE '%global south%' OR tags LIKE '%Global South%' THEN 'Глобален юг'
  ELSE 'Международни'
END
WHERE category IS NULL;

CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
