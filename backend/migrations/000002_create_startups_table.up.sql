CREATE TABLE IF NOT EXISTS startups (
    id               BIGSERIAL     PRIMARY KEY,
    name             TEXT       NOT NULL,
    legal_status     TEXT,
    address          TEXT,
    email            TEXT,
    phone            TEXT,
    created_at       DATE        NOT NULL,
    description      TEXT,
    website_url      TEXT,
    social_media_url TEXT,
    project_status   TEXT,
    needs            TEXT,
    sector           TEXT,
    maturity         TEXT,
    founders         JSONB       NOT NULL DEFAULT '[]'::jsonb,
    views_count      BIGINT      NOT NULL DEFAULT 0,

    CONSTRAINT startups_founders_is_array CHECK (jsonb_typeof(founders) = 'array')
);
