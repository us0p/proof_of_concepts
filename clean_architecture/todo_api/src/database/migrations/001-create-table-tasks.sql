CREATE TABLE IF NOT EXISTS task (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    completed BOOLEAN NOT NULL,
    dueDate DATETIME UNIQUE
);
