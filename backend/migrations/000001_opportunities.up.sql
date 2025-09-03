CREATE TABLE IF NOT EXISTS  opportunities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    organism VARCHAR(255) NOT NULL,
    description TEXT,
    criteria TEXT,
    external_link VARCHAR(500),
    deadline TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);