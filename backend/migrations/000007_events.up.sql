CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100),
    location TEXT,
    target_audience TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    capacity INT,
    image_url TEXT,
);
