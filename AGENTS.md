## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Production URL

https://dailybg.org

## API

Posts are managed via a REST API backed by Cloudflare D1. All write endpoints require an API key.

### Auth

```
Authorization: Bearer dailybg-secret-key-2024
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List all posts |
| POST | `/api/posts` | Create a post |
| GET | `/api/posts/:slug` | Get a single post |
| PUT | `/api/posts/:slug` | Update a post |
| DELETE | `/api/posts/:slug` | Delete a post |

### Create/Update payload

```json
{
  "slug": "my-article-slug",
  "title": "My Article",
  "body": "**Markdown** content",
  "excerpt": "Short summary",
  "category": "Category",
  "tags": ["tag1", "tag2"],
  "author": "Author Name",
  "hero_image": "https://example.com/image.jpg",
  "draft": 0
}
```

Only `slug`, `title`, and `body` are required for create. All fields are optional for update.

### CSRF note

Astro 7 blocks DELETE requests without an `Origin` header. API clients must include `Origin: https://dailybg.org` (or `http://localhost:4321` for local dev) when calling DELETE.
