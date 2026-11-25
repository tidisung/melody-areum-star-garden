CREATE TABLE family_state (id INTEGER PRIMARY KEY CHECK(id=1), revision INTEGER NOT NULL DEFAULT 0, payload TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE events (id INTEGER PRIMARY KEY AUTOINCREMENT, operation_id TEXT NOT NULL, child INTEGER NOT NULL, icon TEXT NOT NULL, text TEXT NOT NULL, amount TEXT NOT NULL, date INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX events_child_date ON events(child, id);
--> statement-breakpoint
CREATE TABLE operations (id TEXT PRIMARY KEY, actor TEXT NOT NULL, fingerprint TEXT NOT NULL, result TEXT NOT NULL, date INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE transaction_guards (id TEXT PRIMARY KEY, valid INTEGER NOT NULL CHECK(valid=1));
--> statement-breakpoint
CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, role TEXT NOT NULL, child INTEGER, created INTEGER NOT NULL, expires INTEGER NOT NULL, label TEXT NOT NULL DEFAULT '');
--> statement-breakpoint
CREATE TABLE pair_codes (code_hash TEXT PRIMARY KEY, child INTEGER NOT NULL, expires INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0);
--> statement-breakpoint
CREATE TABLE auth_limits (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires INTEGER NOT NULL);
