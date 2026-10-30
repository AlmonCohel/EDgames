-- Accounts belong to the grown-up. Nothing about a child is stored, on purpose.
CREATE TABLE users (
  id                TEXT PRIMARY KEY,
  email             TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash     TEXT NOT NULL,
  plan              TEXT NOT NULL DEFAULT 'free',   -- free | basic | pro
  plan_status       TEXT NOT NULL DEFAULT 'active', -- active | early_access | (provider's: past_due, canceled)
  plan_since        TEXT NOT NULL,
  plan_expires_at   TEXT,                           -- past this the plan counts as free; null = no end
  billing_provider  TEXT,                           -- empty until a payment provider is connected
  billing_ref       TEXT,                           -- that provider's customer or subscription id
  lang              TEXT NOT NULL DEFAULT 'he',
  terms_version     TEXT NOT NULL,
  terms_accepted_at TEXT NOT NULL,
  created_at        TEXT NOT NULL,
  last_login_at     TEXT
);

-- The token itself is only ever in the browser; here is its SHA-256.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

CREATE TABLE reset_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE INDEX reset_tokens_user ON reset_tokens(user_id);

-- The audit log: sign-ups, sign-ins, every plan change, resets, deletions.
-- No email or password ever goes in `detail`, and user_id is cleared when the account is deleted.
CREATE TABLE events (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  type    TEXT NOT NULL,
  detail  TEXT,
  at      TEXT NOT NULL
);
CREATE INDEX events_user ON events(user_id);
CREATE INDEX events_type_at ON events(type, at);

-- Rate limiting. `key` is a hash, so no address or email sits here in the clear.
CREATE TABLE rate_hits (
  key TEXT NOT NULL,
  at  INTEGER NOT NULL
);
CREATE INDEX rate_hits_key_at ON rate_hits(key, at);
