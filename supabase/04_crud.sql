-- =====================================================
-- 04_crud.sql
-- StreamFlix Mission 3 - CRUD Demonstration
-- =====================================================

-- CREATE
INSERT INTO public.genre (genre_name)
VALUES ('Mission 3 CRUD Test')
RETURNING genre_id, genre_name;

-- READ
SELECT genre_id, genre_name
FROM public.genre
WHERE genre_name = 'Mission 3 CRUD Test';

-- UPDATE
UPDATE public.genre
SET genre_name = 'Mission 3 CRUD Updated'
WHERE genre_name = 'Mission 3 CRUD Test'
RETURNING genre_id, genre_name;

-- VERIFY UPDATE
SELECT genre_id, genre_name
FROM public.genre
WHERE genre_name = 'Mission 3 CRUD Updated';

-- DELETE
DELETE FROM public.genre
WHERE genre_name = 'Mission 3 CRUD Updated'
RETURNING genre_id, genre_name;

-- VERIFY DELETE
SELECT genre_id, genre_name
FROM public.genre
WHERE genre_name = 'Mission 3 CRUD Updated';