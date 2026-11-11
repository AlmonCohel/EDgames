-- One-time codes that carry a signed-in parent from EDgames to Chatty (2026-11-11).
-- Stored hashed, live two minutes, deleted when used.
CREATE TABLE IF NOT EXISTS handoffs (
  code_hash  TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
