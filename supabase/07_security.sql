-- =====================================================
-- 07_security.sql
-- StreamFlix Mission 3 - Database Security
-- =====================================================

-- 1. CREATE DATABASE ROLES
-- Do not rerun if the roles already exist.

CREATE ROLE streamflix_viewer
WITH LOGIN
PASSWORD 'REDACTED';

CREATE ROLE streamflix_content_editor
WITH LOGIN
PASSWORD 'REDACTED';


-- 2. GRANT SCHEMA ACCESS

GRANT USAGE ON SCHEMA public
TO streamflix_viewer, streamflix_content_editor;


-- 3. VIEWER ROLE PERMISSIONS

GRANT SELECT
ON TABLE
    public.content,
    public.genre,
    public.content_license,
    public.season,
    public.episodes,
    public.plans
TO streamflix_viewer;

REVOKE INSERT, UPDATE, DELETE
ON TABLE
    public.content,
    public.genre,
    public.content_license,
    public.season,
    public.episodes,
    public.plans
FROM streamflix_viewer;


-- 4. CONTENT EDITOR PERMISSIONS

GRANT SELECT, INSERT, UPDATE
ON TABLE
    public.content,
    public.genre,
    public.content_license,
    public.season,
    public.episodes
TO streamflix_content_editor;

REVOKE DELETE
ON TABLE
    public.content,
    public.genre,
    public.content_license,
    public.season,
    public.episodes
FROM streamflix_content_editor;


-- 5. SEQUENCE ACCESS FOR EDITOR

GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO streamflix_content_editor;


-- 6. RLS POLICIES USED FOR DIRECT-ROLE TESTING

CREATE POLICY "streamflix_viewer_read_content"
ON public.content
FOR SELECT
TO streamflix_viewer
USING (true);

CREATE POLICY "streamflix_editor_read_content"
ON public.content
FOR SELECT
TO streamflix_content_editor
USING (true);

CREATE POLICY "streamflix_editor_update_content"
ON public.content
FOR UPDATE
TO streamflix_content_editor
USING (true)
WITH CHECK (true);


-- 7. VERIFY THAT THE ROLES EXIST

SELECT
    rolname,
    rolcanlogin
FROM pg_roles
WHERE rolname IN (
    'streamflix_viewer',
    'streamflix_content_editor'
)
ORDER BY rolname;


-- 8. VERIFY TABLE PRIVILEGES

SELECT
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee IN (
    'streamflix_viewer',
    'streamflix_content_editor'
)
ORDER BY grantee, table_name, privilege_type;


-- 9. VERIFY EDITOR PRIVILEGES ON CONTENT

SELECT
    has_table_privilege(
        'streamflix_content_editor',
        'public.content',
        'SELECT'
    ) AS can_select,

    has_table_privilege(
        'streamflix_content_editor',
        'public.content',
        'INSERT'
    ) AS can_insert,

    has_table_privilege(
        'streamflix_content_editor',
        'public.content',
        'UPDATE'
    ) AS can_update,

    has_table_privilege(
        'streamflix_content_editor',
        'public.content',
        'DELETE'
    ) AS can_delete;


-- =====================================================
-- DIRECT POSTGRESQL CONNECTION TESTS
-- Run these while logged in using SQL Shell / psql.
-- =====================================================

-- 10. CONFIRM CURRENT ROLE

SELECT current_user;


-- 11. VIEWER - ALLOWED ACTION

SELECT content_id, title, type
FROM public.content
LIMIT 5;


-- 12. VIEWER - DENIED ACTION

UPDATE public.content
SET title = 'Security Test'
WHERE content_id = 1;


-- 13. EDITOR - ALLOWED ACTION

UPDATE public.content
SET description = description
WHERE content_id = 1;


-- 14. EDITOR - DENIED ACTION

DELETE FROM public.content
WHERE content_id = 1;