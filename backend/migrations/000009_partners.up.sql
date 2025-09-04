CREATE TABLE IF NOT EXISTS partners (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    legal_status VARCHAR(255),
    address TEXT,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100),
    created_at TIMESTAMP,
    description TEXT,
    partnership_type VARCHAR(255),

    created_at_local TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at_local TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);