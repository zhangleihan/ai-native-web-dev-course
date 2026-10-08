CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY, username TEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('student','admin'))
);
CREATE TABLE IF NOT EXISTS cases (
 id UUID PRIMARY KEY, title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 100),
 industry TEXT NOT NULL CHECK (length(trim(industry)) BETWEEN 1 AND 50),
 difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced')),
 owner_id UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS runs (
 id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES users(id), case_id UUID NOT NULL REFERENCES cases(id),
 status TEXT NOT NULL CHECK (status IN ('RUNNING','WAITING_APPROVAL','COMPLETED','CANCELLED','FAILED')),
 proposal JSONB, trace JSONB NOT NULL DEFAULT '[]', error TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS approvals (
 run_id UUID PRIMARY KEY REFERENCES runs(id), actor_id UUID NOT NULL REFERENCES users(id),
 decision TEXT NOT NULL CHECK (decision IN ('approve','reject')), decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS work_orders (
 id UUID PRIMARY KEY, run_id UUID UNIQUE NOT NULL REFERENCES runs(id),
 case_id UUID NOT NULL REFERENCES cases(id), title TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- express-session / connect-pg-simple storage; cookie contains only an opaque signed id.
CREATE TABLE IF NOT EXISTS sessions (sid VARCHAR PRIMARY KEY, sess JSON NOT NULL, expire TIMESTAMP(6) NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions(expire);
INSERT INTO schema_migrations(version) VALUES ('001') ON CONFLICT DO NOTHING;
