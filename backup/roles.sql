
SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

CREATE ROLE "app_admin";
ALTER ROLE "app_admin" WITH INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOBYPASSRLS;
CREATE ROLE "app_content_manager";
ALTER ROLE "app_content_manager" WITH INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOBYPASSRLS;
CREATE ROLE "app_subscriber";
ALTER ROLE "app_subscriber" WITH INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOBYPASSRLS;
CREATE ROLE "app_support";
ALTER ROLE "app_support" WITH INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOBYPASSRLS;
CREATE ROLE "streamflix_content_editor";
ALTER ROLE "streamflix_content_editor" WITH INHERIT NOCREATEROLE NOCREATEDB LOGIN NOBYPASSRLS;
CREATE ROLE "streamflix_viewer";
ALTER ROLE "streamflix_viewer" WITH INHERIT NOCREATEROLE NOCREATEDB LOGIN NOBYPASSRLS;

ALTER ROLE "anon" SET "statement_timeout" TO '3s';

ALTER ROLE "authenticated" SET "statement_timeout" TO '8s';

ALTER ROLE "authenticator" SET "statement_timeout" TO '8s';

GRANT SET ON PARAMETER "log_min_messages" TO "supabase_realtime_admin";

RESET ALL;
