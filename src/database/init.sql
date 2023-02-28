-- Init script for PSQL database

-- Add fuzzystrmatch extension to database if it doesn't exist
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;