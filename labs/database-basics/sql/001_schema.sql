CREATE TABLE authors (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL UNIQUE CHECK (length(trim(username)) BETWEEN 1 AND 50)
);
CREATE TABLE cases (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 100),
  industry TEXT NOT NULL CHECK (length(trim(industry)) BETWEEN 1 AND 50),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced')),
  author_id UUID REFERENCES authors(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE tags (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) BETWEEN 1 AND 30)
);
CREATE TABLE case_tags (
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE RESTRICT,
  PRIMARY KEY (case_id, tag_id)
);
