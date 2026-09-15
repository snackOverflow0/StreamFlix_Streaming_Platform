-- ============================================================
-- STREAMFLIX STREAMING PLATFORM
-- MISSION 3 - #6 TRANSACTIONS
-- ============================================================
-- Purpose:
-- 1. Demonstrate a successful transaction using COMMIT
-- 2. Demonstrate a failed transaction using ROLLBACK
-- ============================================================


-- ============================================================
-- TRANSACTION 1: SUCCESSFUL TRANSACTION
-- ============================================================
-- This transaction adds a content item to a user's favorites.
--
-- IMPORTANT:
-- Replace the UUID below with the UUID of your test Auth user.
-- Make sure content_id = 1 exists in your content table.
-- ============================================================

BEGIN;

INSERT INTO favorites (
    user_id,
    content_id
)
VALUES (
    'YOUR-AUTH-USER-UUID',
    1
);

COMMIT;


-- ============================================================
-- VERIFY TRANSACTION 1
-- ============================================================

SELECT
    favorite_id,
    user_id,
    content_id,
    created_at
FROM favorites
WHERE user_id = 'YOUR-AUTH-USER-UUID'
  AND content_id = 1;


-- ============================================================
-- TRANSACTION 2: FAILED TRANSACTION + ROLLBACK
-- ============================================================
-- This transaction intentionally uses a content_id that should
-- not exist.
--
-- Because favorites.content_id references content.content_id,
-- PostgreSQL should reject the INSERT because of the
-- foreign-key constraint.
--
-- After the error, execute ROLLBACK.
-- ============================================================

BEGIN;

INSERT INTO favorites (
    user_id,
    content_id
)
VALUES (
    'YOUR-AUTH-USER-UUID',
    999999
);

-- The INSERT above should fail because content_id 999999
-- does not exist.
--
-- If PostgreSQL leaves the transaction open after the error,
-- run:
--
-- ROLLBACK;


-- ============================================================
-- ROLLBACK
-- ============================================================
-- Run this after the failed INSERT.
-- ============================================================

ROLLBACK;


-- ============================================================
-- VERIFY TRANSACTION 2
-- ============================================================
-- The failed transaction should NOT create a favorite.
-- Expected result: 0 rows.
-- ============================================================

SELECT
    favorite_id,
    user_id,
    content_id,
    created_at
FROM favorites
WHERE user_id = 'YOUR-AUTH-USER-UUID'
  AND content_id = 999999;


-- ============================================================
-- END OF MISSION 3 - #6 TRANSACTIONS
-- ============================================================