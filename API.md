# API

REST API for managing posts on [dailybg.org](https://dailybg.org), backed by Cloudflare D1.

All endpoints are versioned under `/api/v1`. A legacy `/api/posts` (v0) endpoint still exists but is deprecated and undocumented here.

## Authentication

All write endpoints (POST, PATCH, DELETE) require an API key via Bearer token:

```
Authorization: Bearer dailybg-secret-key-2024
```

Write endpoints return `401 Unauthorized` (envelope `{ "error": "Unauthorized", "code": "UNAUTHORIZED" }`) if the key is missing or invalid. Read endpoints (GET) are public.

## Canonical `Post` resource

```json
{
  "slug":        "my-article",
  "title":       "My Article",
  "excerpt":     "Short summary",
  "body":        "**Markdown** content",
  "html":        "<p><strong>Markdown</strong> content</p>",
  "pubDate":     "2023-11-14T22:13:20.000Z",
  "updatedDate": null,
  "tags":        ["tag1", "tag2"],
  "author":      "Author Name",
  "heroImage":   "https://example.com/image.jpg",
  "draft":       false,
  "readingTime": 1
}
```

- All fields are `camelCase`, in both requests and responses.
- `draft` is a boolean.
- `html` and `readingTime` are **server-derived** from `body`; they are never accepted as input.
- `pubDate` / `updatedDate` are ISO-8601 strings. `updatedDate` is `null` until the first edit that bumps it.
- `slug` is the only URL identifier; it is immutable in `PATCH` (see rename endpoint).

### List item (`PostSummary`)

List endpoints return a lighter shape without `body` / `html`:

```json
{
  "slug": "my-article", "title": "My Article", "excerpt": "Short summary",
  "pubDate": "2023-11-14T22:13:20.000Z", "updatedDate": null,
  "category": "Category", "tags": ["tag1", "tag2"], "author": "Author Name",
  "heroImage": "https://example.com/image.jpg", "draft": false, "readingTime": 1
}
```

## Endpoints

### List posts

```
GET /api/v1/posts
```

**Query params**

| Param     | Type   | Default     | Notes |
|-----------|--------|-------------|-------|
| `page`    | int    | 1           | 1-based |
| `limit`   | int    | 20          | max 100 |
| `status`  | enum   | `published` | `published` \| `draft` \| `all` |
| `tag`     | string | —           | exact match |
| `author`  | string | —           | exact match |
| `q`       | string | —           | full-text search on title + body |
| `sort`    | string | `-pubDate`  | `-pubDate`, `pubDate`, `title`, `-updatedDate` |
| `from`    | ISO date | —         | `pubDate >=` |
| `to`      | ISO date | —          | `pubDate <=` |

**Response — `200`** (paginated envelope; items are `PostSummary`)

```json
{
  "data": [ { "slug": "...", "title": "...", "excerpt": "...", "pubDate": "...", "updatedDate": null, "tags": ["..."], "author": "...", "heroImage": "...", "draft": false, "readingTime": 1 } ],
  "pagination": { "page": 1, "limit": 20, "total": 134, "totalPages": 7 }
}
```

### Create post

```
POST /api/v1/posts
```

| Field       | Type     | Required | Notes |
|-------------|----------|----------|-------|
| `slug`      | string   | yes      | unique; `[a-zA-Z0-9-]` only |
| `title`     | string   | yes      | |
| `body`      | string   | yes      | markdown |
| `excerpt`   | string   | no       | |
| `tags`      | string[] | no       | |
| `author`    | string   | no       | |
| `heroImage` | string   | no       | |
| `draft`     | bool     | no       | default `true` |
| `pubDate`   | ISO date | no       | default `now()` — allows backfill/scheduling |

**`201 Created`** — full `Post`. **`409 Conflict`** if the slug already exists.

### Get post

```
GET /api/v1/posts/:slug
```

**`200`** — full `Post`. **`404`** if not found.

### Update post (partial)

```
PATCH /api/v1/posts/:slug
```

Any subset of the create fields (excluding `slug`). Supports an extra flag:

| Field         | Type | Notes |
|---------------|------|-------|
| `bumpUpdated` | bool | default `true`; set `false` for silent edits (typo fixes, etc.) |

**`200`** — updated `Post`. **`404`** if not found.

### Rename post (slug change)

Slugs aren't editable inside `PATCH` (ambiguous identity). Dedicated endpoint:

```
POST /api/v1/posts/:slug/rename
{ "newSlug": "renamed-article" }
```

**`200`** with the updated `Post`. **`409`** if `newSlug` already exists. **`404`** if the original slug doesn't exist.

### Delete post

```
DELETE /api/v1/posts/:slug
```

Permanent hard delete. **`204 No Content`** on success. **`404`** if not found.

> **Astro CSRF note:** Astro's origin-check middleware requires either a `Content-Type` header or a matching `Origin` header on unsafe requests (POST/PATCH/DELETE). API clients should send `Content-Type: application/json` (and `Origin: https://dailybg.org`, or `http://localhost:4321` locally). As a convenience, a `POST` alias is also provided:
>
> ```
> POST /api/v1/posts/:slug/delete
> ```
>
> Same semantics as `DELETE`.

### Bulk operations

```
POST /api/v1/posts/bulk
{
  "action": "publish" | "unpublish" | "delete",
  "slugs":  ["a", "b", "c"]
}
```

**`200`** returns per-slug results so partial failures are visible:

```json
{
  "results": [
    { "slug": "a", "ok": true },
    { "slug": "b", "ok": false, "error": "not_found" }
  ]
}
```

### Tags

```
GET /api/v1/tags
```

Returns `[ { "name": "...", "count": 12 } ]` — drives sidebar filters in the admin UI.

### Stats

```
GET /api/v1/stats
```

```json
{
  "total":      134,
  "published":  120,
  "drafts":     14,
  "byMonth":    [ { "month": "2024-11", "count": 8 } ]
}
```

## Errors

Consistent envelope with a machine code:

```json
{ "error": "Post not found", "code": "POST_NOT_FOUND" }
```

| Status | Code | When |
|--------|------|------|
| 400    | `INVALID_BODY` / `MISSING_FIELD` / `INVALID_SLUG` | bad JSON, missing required field, or invalid slug format |
| 401    | `UNAUTHORIZED` | missing/invalid API key on a write endpoint |
| 404    | `POST_NOT_FOUND` | unknown slug |
| 409    | `SLUG_CONFLICT` | create or rename with an existing slug |
