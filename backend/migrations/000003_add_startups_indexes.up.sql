CREATE INDEX IF NOT EXISTS idx_startups_name_ci
    ON startups (lower(name));