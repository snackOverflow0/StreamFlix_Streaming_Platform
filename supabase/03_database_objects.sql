-- ============================================================
-- STREAMFLIX STREAMING PLATFORM
-- MISSION 3 - DATABASE OBJECTS
-- View, Stored Procedure, and Trigger
-- ============================================================
-- Project: StreamFlix_Streaming_Platform
-- Database: Supabase PostgreSQL
--
-- Mission 3 requirement:
-- One view + one procedure + one trigger.
--
-- Current database structure:
-- content.type = content_type_enum
-- review.rating_value
-- review.review_comment
-- review.review_date
-- ============================================================


-- ============================================================
-- 1. VIEW
-- ============================================================
-- Purpose:
-- Provides a reusable content catalog containing content,
-- genre, and license information.
--
-- Soft-deleted content is excluded using deleted_at.

CREATE OR REPLACE VIEW content_catalog AS
SELECT
    c.content_id,
    c.title,
    c.type,
    g.genre_name,
    cl.licensor_name,
    c.release_date,
    c.director,
    c.age_rating
FROM content c
LEFT JOIN genre g
    ON c.genre_id = g.genre_id
LEFT JOIN content_license cl
    ON c.license_id = cl.license_id
WHERE c.deleted_at IS NULL;


-- VIEW TEST

SELECT *
FROM content_catalog
ORDER BY release_date DESC;


-- ============================================================
-- 2. STORED PROCEDURE
-- ============================================================
-- Purpose:
-- Adds a new content record using a reusable procedure.
--
-- The content.type column uses the PostgreSQL enum
-- content_type_enum, so p_type is explicitly cast.

CREATE OR REPLACE PROCEDURE add_content(
    p_title TEXT,
    p_type TEXT,
    p_genre_id BIGINT,
    p_license_id BIGINT,
    p_description TEXT,
    p_release_date DATE,
    p_director TEXT,
    p_synopsis TEXT,
    p_age_rating TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO content (
        title,
        type,
        genre_id,
        license_id,
        description,
        release_date,
        director,
        synopsis,
        age_rating
    )
    VALUES (
        p_title,
        p_type::content_type_enum,
        p_genre_id,
        p_license_id,
        p_description,
        p_release_date,
        p_director,
        p_synopsis,
        p_age_rating
    );
END;
$$;


-- PROCEDURE TEST
-- Creates a test content record.

CALL add_content(
    'CRUD Test Movie',
    'movie',
    1,
    1,
    'Test content created using a stored procedure.',
    '2026-09-16',
    'Test Director',
    'A test movie created to demonstrate the StreamFlix stored procedure.',
    'PG-13'
);


-- PROCEDURE VERIFICATION

SELECT
    content_id,
    title,
    type,
    genre_id,
    license_id,
    description,
    release_date,
    director,
    synopsis,
    age_rating
FROM content
WHERE title = 'CRUD Test Movie'
ORDER BY content_id DESC
LIMIT 1;


-- ============================================================
-- 3. TRIGGER FUNCTION
-- ============================================================
-- Purpose:
-- Automatically sets review_date to the current timestamp
-- whenever a review is updated.

CREATE OR REPLACE FUNCTION update_review_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.review_date = NOW();
    RETURN NEW;
END;
$$;


-- ============================================================
-- 4. TRIGGER
-- ============================================================
-- Purpose:
-- Executes update_review_date() before a review is updated.

DROP TRIGGER IF EXISTS review_date_trigger ON review;

CREATE TRIGGER review_date_trigger
BEFORE UPDATE ON review
FOR EACH ROW
EXECUTE FUNCTION update_review_date();


-- ============================================================
-- 5. TRIGGER VERIFICATION
-- ============================================================
-- Confirm that the trigger exists.

SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'review_date_trigger';


-- ============================================================
-- 6. TRIGGER TEST
-- ============================================================
-- Uses review_id = 1 as an example.
--
-- IMPORTANT:
-- If review_id = 1 does not exist in your database,
-- replace 1 with an existing review_id.

UPDATE review
SET review_comment = 'Updated review comment for trigger testing.'
WHERE review_id = 1;


-- TRIGGER RESULT

SELECT
    review_id,
    rating_value,
    review_comment,
    review_date
FROM review
WHERE review_id = 1;


-- ============================================================
-- DATABASE OBJECTS SUMMARY
-- ============================================================
--
-- VIEW
--     content_catalog
--
-- PROCEDURE
--     add_content
--
-- TRIGGER FUNCTION
--     update_review_date()
--
-- TRIGGER
--     review_date_trigger
--
-- ============================================================
-- END OF MISSION 3 - DATABASE OBJECTS
-- ============================================================