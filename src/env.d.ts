/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: import("@cloudflare/workers-types").D1Database;
}
