


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."account_status_enum" AS ENUM (
    'active',
    'deactivated',
    'suspended'
);


ALTER TYPE "public"."account_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."content_type_enum" AS ENUM (
    'movie',
    'series'
);


ALTER TYPE "public"."content_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."listing_status_enum" AS ENUM (
    'active',
    'sold_out',
    'removed'
);


ALTER TYPE "public"."listing_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."subscription_status" AS ENUM (
    'active',
    'expired',
    'cancelled',
    'past_due'
);


ALTER TYPE "public"."subscription_status" OWNER TO "postgres";


CREATE TYPE "public"."watchlist_status_enum" AS ENUM (
    'planned',
    'in_progress',
    'completed'
);


ALTER TYPE "public"."watchlist_status_enum" OWNER TO "postgres";


CREATE PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_age_rating" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO content (
    title,
    type,
    genre_id,
    description,
    release_date,
    director,
    age_rating
  )
  VALUES (
    p_title,
    p_type,
    p_genre_id,
    p_description,
    p_release_date,
    p_director,
    p_age_rating
  );
  END;
  $$;


ALTER PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_age_rating" "text") OWNER TO "postgres";


CREATE PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_license_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_age_rating" "text")
    LANGUAGE "plpgsql"
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
        p_age_rating
    );
END;
$$;


ALTER PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_license_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_age_rating" "text") OWNER TO "postgres";


CREATE PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_license_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_synopsis" "text", IN "p_age_rating" "text")
    LANGUAGE "plpgsql"
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


ALTER PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_license_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_synopsis" "text", IN "p_age_rating" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_app_user_id"() RETURNS integer
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
    select nullif(current_setting('app.current_user_id', true), '')::integer;
$$;


ALTER FUNCTION "public"."current_app_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_review_date"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.review_date = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_review_date"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."content" (
    "content_id" integer NOT NULL,
    "genre_id" integer NOT NULL,
    "license_id" integer NOT NULL,
    "title" character varying(150) NOT NULL,
    "description" "text" NOT NULL,
    "release_date" "date" NOT NULL,
    "director" character varying(100),
    "cast_info" "text",
    "synopsis" "text" NOT NULL,
    "type" "public"."content_type_enum" NOT NULL,
    "age_rating" character varying(20) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "trailer_url" "text"
);


ALTER TABLE "public"."content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_license" (
    "license_id" integer NOT NULL,
    "licensor_name" character varying(100) NOT NULL,
    "expiration_date" "date" NOT NULL,
    "region" character varying(50) NOT NULL
);


ALTER TABLE "public"."content_license" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."genre" (
    "genre_id" integer NOT NULL,
    "genre_name" character varying(50) NOT NULL
);


ALTER TABLE "public"."genre" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."content_catalog" WITH ("security_invoker"='on') AS
 SELECT "c"."content_id",
    "c"."title",
    "c"."type",
    "g"."genre_name",
    "cl"."licensor_name",
    "c"."release_date",
    "c"."director",
    "c"."age_rating"
   FROM (("public"."content" "c"
     LEFT JOIN "public"."genre" "g" ON (("c"."genre_id" = "g"."genre_id")))
     LEFT JOIN "public"."content_license" "cl" ON (("c"."license_id" = "cl"."license_id")))
  WHERE ("c"."deleted_at" IS NULL);


ALTER VIEW "public"."content_catalog" OWNER TO "postgres";


ALTER TABLE "public"."content" ALTER COLUMN "content_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."content_content_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."content_license" ALTER COLUMN "license_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."content_license_license_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."episodes" (
    "episode_id" integer NOT NULL,
    "season_id" integer NOT NULL,
    "episode_number" integer NOT NULL,
    "episode_title" character varying(150) NOT NULL,
    "duration" integer NOT NULL,
    "release_date" "date" NOT NULL,
    CONSTRAINT "episodes_duration_check" CHECK (("duration" > 0))
);


ALTER TABLE "public"."episodes" OWNER TO "postgres";


ALTER TABLE "public"."episodes" ALTER COLUMN "episode_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."episodes_episode_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "fav_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "content_id" integer NOT NULL,
    "date_added" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


ALTER TABLE "public"."favorites" ALTER COLUMN "fav_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."favorites_fav_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "feedback_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "subject" character varying(150) NOT NULL,
    "message" "text" NOT NULL,
    "created_date" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."feedback" OWNER TO "postgres";


ALTER TABLE "public"."feedback" ALTER COLUMN "feedback_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."feedback_feedback_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."genre" ALTER COLUMN "genre_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."genre_genre_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."members" (
    "member_id" integer NOT NULL,
    "subscription_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "relationship" character varying(50) NOT NULL,
    "date_added" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."members" OWNER TO "postgres";


ALTER TABLE "public"."members" ALTER COLUMN "member_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."members_member_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."merchandise_product" (
    "product_id" integer NOT NULL,
    "product_name" character varying(100) NOT NULL,
    "category" character varying(50) NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "listing_status" "public"."listing_status_enum" DEFAULT 'active'::"public"."listing_status_enum" NOT NULL,
    CONSTRAINT "merchandise_product_price_check" CHECK (("price" >= (0)::numeric))
);


ALTER TABLE "public"."merchandise_product" OWNER TO "postgres";


ALTER TABLE "public"."merchandise_product" ALTER COLUMN "product_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."merchandise_product_product_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."merchandise_transaction" (
    "transaction_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "product_id" integer NOT NULL,
    "quantity" integer NOT NULL,
    "total_amount" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "merchandise_transaction_quantity_check" CHECK (("quantity" > 0)),
    CONSTRAINT "merchandise_transaction_total_amount_check" CHECK (("total_amount" >= (0)::numeric))
);


ALTER TABLE "public"."merchandise_transaction" OWNER TO "postgres";


ALTER TABLE "public"."merchandise_transaction" ALTER COLUMN "transaction_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."merchandise_transaction_transaction_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."plans" (
    "plan_id" integer NOT NULL,
    "plan_name" character varying(50) NOT NULL,
    "max_members" integer NOT NULL,
    "monthly_price" numeric(10,2) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    CONSTRAINT "plans_max_members_check" CHECK (("max_members" > 0)),
    CONSTRAINT "plans_monthly_price_check" CHECK (("monthly_price" >= (0)::numeric))
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


ALTER TABLE "public"."plans" ALTER COLUMN "plan_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."plans_plan_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "profile_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "profile_name" character varying(50) NOT NULL,
    "avatar_url" character varying(255),
    "device" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE "public"."profiles" ALTER COLUMN "profile_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."profiles_profile_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."review" (
    "review_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "content_id" integer NOT NULL,
    "rating_value" numeric(2,1) NOT NULL,
    "review_comment" "text",
    "review_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "review_rating_value_check" CHECK ((("rating_value" >= (0)::numeric) AND ("rating_value" <= (5)::numeric)))
);


ALTER TABLE "public"."review" OWNER TO "postgres";


ALTER TABLE "public"."review" ALTER COLUMN "review_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."review_review_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."season" (
    "season_id" integer NOT NULL,
    "content_id" integer NOT NULL,
    "season_number" integer NOT NULL,
    "season_title" character varying(150),
    "release_date" "date" NOT NULL
);


ALTER TABLE "public"."season" OWNER TO "postgres";


ALTER TABLE "public"."season" ALTER COLUMN "season_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."season_season_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "subscription_id" integer NOT NULL,
    "subscription_user_id" integer NOT NULL,
    "plan_id" integer NOT NULL,
    "start_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "end_date" "date",
    "status" "public"."subscription_status" DEFAULT 'active'::"public"."subscription_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "subscriptions_check" CHECK ((("end_date" IS NULL) OR ("end_date" >= "start_date")))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


ALTER TABLE "public"."subscriptions" ALTER COLUMN "subscription_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."subscriptions_subscription_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."users" (
    "user_id" integer NOT NULL,
    "full_name" character varying(100) NOT NULL,
    "email" character varying(100) NOT NULL,
    "password_hash" character varying(255),
    "phone_number" character varying(20),
    "date_of_birth" "date",
    "account_status" "public"."account_status_enum" DEFAULT 'active'::"public"."account_status_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'BP1 - User Account Management';



ALTER TABLE "public"."users" ALTER COLUMN "user_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."users_user_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."view_history" (
    "history_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "content_id" integer NOT NULL,
    "episode_id" integer,
    "watch_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "progress_percentage" numeric(5,2) DEFAULT 0 NOT NULL,
    CONSTRAINT "view_history_progress_percentage_check" CHECK ((("progress_percentage" >= (0)::numeric) AND ("progress_percentage" <= (100)::numeric)))
);


ALTER TABLE "public"."view_history" OWNER TO "postgres";


ALTER TABLE "public"."view_history" ALTER COLUMN "history_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."view_history_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."watch_list" (
    "list_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "content_id" integer NOT NULL,
    "episode_id" integer,
    "progress" numeric(5,2) DEFAULT 0,
    "date_added" timestamp with time zone DEFAULT "now"() NOT NULL,
    "watchlist_status" "public"."watchlist_status_enum" DEFAULT 'planned'::"public"."watchlist_status_enum" NOT NULL,
    CONSTRAINT "watch_list_progress_check" CHECK ((("progress" >= (0)::numeric) AND ("progress" <= (100)::numeric)))
);


ALTER TABLE "public"."watch_list" OWNER TO "postgres";


ALTER TABLE "public"."watch_list" ALTER COLUMN "list_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."watch_list_list_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."content_license"
    ADD CONSTRAINT "content_license_pkey" PRIMARY KEY ("license_id");



ALTER TABLE ONLY "public"."content"
    ADD CONSTRAINT "content_pkey" PRIMARY KEY ("content_id");



ALTER TABLE ONLY "public"."episodes"
    ADD CONSTRAINT "episodes_pkey" PRIMARY KEY ("episode_id");



ALTER TABLE ONLY "public"."episodes"
    ADD CONSTRAINT "episodes_season_id_episode_number_key" UNIQUE ("season_id", "episode_number");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("fav_id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_content_id_key" UNIQUE ("user_id", "content_id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("feedback_id");



ALTER TABLE ONLY "public"."genre"
    ADD CONSTRAINT "genre_genre_name_key" UNIQUE ("genre_name");



ALTER TABLE ONLY "public"."genre"
    ADD CONSTRAINT "genre_pkey" PRIMARY KEY ("genre_id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_pkey" PRIMARY KEY ("member_id");



ALTER TABLE ONLY "public"."merchandise_product"
    ADD CONSTRAINT "merchandise_product_pkey" PRIMARY KEY ("product_id");



ALTER TABLE ONLY "public"."merchandise_transaction"
    ADD CONSTRAINT "merchandise_transaction_pkey" PRIMARY KEY ("transaction_id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("plan_id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_plan_name_key" UNIQUE ("plan_name");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("profile_id");



ALTER TABLE ONLY "public"."review"
    ADD CONSTRAINT "review_pkey" PRIMARY KEY ("review_id");



ALTER TABLE ONLY "public"."review"
    ADD CONSTRAINT "review_user_id_content_id_key" UNIQUE ("user_id", "content_id");



ALTER TABLE ONLY "public"."season"
    ADD CONSTRAINT "season_content_id_season_number_key" UNIQUE ("content_id", "season_number");



ALTER TABLE ONLY "public"."season"
    ADD CONSTRAINT "season_pkey" PRIMARY KEY ("season_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("subscription_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "uq_profiles_user_id" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."view_history"
    ADD CONSTRAINT "view_history_pkey" PRIMARY KEY ("history_id");



ALTER TABLE ONLY "public"."watch_list"
    ADD CONSTRAINT "watch_list_pkey" PRIMARY KEY ("list_id");



ALTER TABLE ONLY "public"."watch_list"
    ADD CONSTRAINT "watch_list_user_id_content_id_key" UNIQUE ("user_id", "content_id");



CREATE INDEX "idx_content_genre" ON "public"."content" USING "btree" ("genre_id");



CREATE INDEX "idx_content_license" ON "public"."content" USING "btree" ("license_id");



CREATE INDEX "idx_content_title" ON "public"."content" USING "gin" ("to_tsvector"('"english"'::"regconfig", ("title")::"text"));



CREATE INDEX "idx_members_subscription" ON "public"."members" USING "btree" ("subscription_id");



CREATE INDEX "idx_merch_txn_product" ON "public"."merchandise_transaction" USING "btree" ("product_id");



CREATE INDEX "idx_merch_txn_user" ON "public"."merchandise_transaction" USING "btree" ("user_id");



CREATE INDEX "idx_subscriptions_user" ON "public"."subscriptions" USING "btree" ("subscription_user_id");



CREATE INDEX "idx_view_history_content" ON "public"."view_history" USING "btree" ("content_id");



CREATE INDEX "idx_view_history_user" ON "public"."view_history" USING "btree" ("user_id");



CREATE UNIQUE INDEX "uq_one_active_subscription_per_user" ON "public"."subscriptions" USING "btree" ("subscription_user_id") WHERE ("status" = 'active'::"public"."subscription_status");



CREATE OR REPLACE TRIGGER "review_date_trigger" BEFORE UPDATE ON "public"."review" FOR EACH ROW EXECUTE FUNCTION "public"."update_review_date"();



CREATE OR REPLACE TRIGGER "trg_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."content"
    ADD CONSTRAINT "content_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "public"."genre"("genre_id");



ALTER TABLE ONLY "public"."content"
    ADD CONSTRAINT "content_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "public"."content_license"("license_id");



ALTER TABLE ONLY "public"."episodes"
    ADD CONSTRAINT "episodes_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "public"."season"("season_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("subscription_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."merchandise_transaction"
    ADD CONSTRAINT "merchandise_transaction_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."merchandise_product"("product_id");



ALTER TABLE ONLY "public"."merchandise_transaction"
    ADD CONSTRAINT "merchandise_transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review"
    ADD CONSTRAINT "review_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review"
    ADD CONSTRAINT "review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."season"
    ADD CONSTRAINT "season_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("plan_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_subscription_user_id_fkey" FOREIGN KEY ("subscription_user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."view_history"
    ADD CONSTRAINT "view_history_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."view_history"
    ADD CONSTRAINT "view_history_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("episode_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."view_history"
    ADD CONSTRAINT "view_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."watch_list"
    ADD CONSTRAINT "watch_list_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content"("content_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."watch_list"
    ADD CONSTRAINT "watch_list_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("episode_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."watch_list"
    ADD CONSTRAINT "watch_list_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



CREATE POLICY "Allow content read" ON "public"."content" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow episodes read" ON "public"."episodes" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow genre read" ON "public"."genre" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow merchandise products read" ON "public"."merchandise_product" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow plans read" ON "public"."plans" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow season read" ON "public"."season" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Anyone can view content licenses" ON "public"."content_license" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Authenticated users can delete content" ON "public"."content" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert content" ON "public"."content" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can update content" ON "public"."content" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can view content" ON "public"."content" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."content" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_license" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."episodes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "favorites_admin_delete" ON "public"."favorites" FOR DELETE TO "app_admin" USING (true);



CREATE POLICY "favorites_admin_insert" ON "public"."favorites" FOR INSERT TO "app_admin" WITH CHECK (true);



CREATE POLICY "favorites_admin_select" ON "public"."favorites" FOR SELECT TO "app_admin" USING (true);



CREATE POLICY "favorites_admin_update" ON "public"."favorites" FOR UPDATE TO "app_admin" USING (true) WITH CHECK (true);



CREATE POLICY "favorites_owner_delete" ON "public"."favorites" FOR DELETE TO "authenticated" USING (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "favorites_owner_insert" ON "public"."favorites" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "favorites_owner_select" ON "public"."favorites" FOR SELECT TO "authenticated" USING (("user_id" = "public"."current_app_user_id"()));



ALTER TABLE "public"."feedback" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "feedback_owner_insert" ON "public"."feedback" FOR INSERT WITH CHECK (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "feedback_owner_select" ON "public"."feedback" FOR SELECT USING (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "feedback_owner_update" ON "public"."feedback" FOR UPDATE USING (("user_id" = "public"."current_app_user_id"())) WITH CHECK (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "feedback_support_select" ON "public"."feedback" FOR SELECT TO "app_support" USING (true);



CREATE POLICY "feedback_support_update" ON "public"."feedback" FOR UPDATE TO "app_support" USING (true) WITH CHECK (true);



ALTER TABLE "public"."genre" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "members_admin_delete" ON "public"."members" FOR DELETE TO "app_admin" USING (true);



CREATE POLICY "members_admin_insert" ON "public"."members" FOR INSERT TO "app_admin" WITH CHECK (true);



CREATE POLICY "members_admin_select" ON "public"."members" FOR SELECT TO "app_admin" USING (true);



CREATE POLICY "members_admin_update" ON "public"."members" FOR UPDATE TO "app_admin" USING (true) WITH CHECK (true);



CREATE POLICY "members_owner_delete" ON "public"."members" FOR DELETE USING (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "members_owner_insert" ON "public"."members" FOR INSERT WITH CHECK (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "members_owner_select" ON "public"."members" FOR SELECT USING (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "members_owner_update" ON "public"."members" FOR UPDATE USING (("user_id" = "public"."current_app_user_id"())) WITH CHECK (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "merch_txn_owner_insert" ON "public"."merchandise_transaction" FOR INSERT WITH CHECK (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "merch_txn_owner_select" ON "public"."merchandise_transaction" FOR SELECT USING (("user_id" = "public"."current_app_user_id"()));



ALTER TABLE "public"."merchandise_product" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "merchandise_product_admin_delete" ON "public"."merchandise_product" FOR DELETE TO "app_admin" USING (true);



CREATE POLICY "merchandise_product_admin_insert" ON "public"."merchandise_product" FOR INSERT TO "app_admin" WITH CHECK (true);



CREATE POLICY "merchandise_product_admin_select" ON "public"."merchandise_product" FOR SELECT TO "app_admin" USING (true);



CREATE POLICY "merchandise_product_admin_update" ON "public"."merchandise_product" FOR UPDATE TO "app_admin" USING (true) WITH CHECK (true);



ALTER TABLE "public"."merchandise_transaction" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_admin_delete" ON "public"."profiles" FOR DELETE TO "app_admin" USING (true);



CREATE POLICY "profiles_admin_insert" ON "public"."profiles" FOR INSERT TO "app_admin" WITH CHECK (true);



CREATE POLICY "profiles_admin_select" ON "public"."profiles" FOR SELECT TO "app_admin" USING (true);



CREATE POLICY "profiles_admin_update" ON "public"."profiles" FOR UPDATE TO "app_admin" USING (true) WITH CHECK (true);



CREATE POLICY "profiles_owner_delete" ON "public"."profiles" FOR DELETE USING (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "profiles_owner_insert" ON "public"."profiles" FOR INSERT WITH CHECK (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "profiles_owner_select" ON "public"."profiles" FOR SELECT USING (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "profiles_owner_update" ON "public"."profiles" FOR UPDATE USING (("user_id" = "public"."current_app_user_id"())) WITH CHECK (("user_id" = "public"."current_app_user_id"()));



ALTER TABLE "public"."review" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "review_owner_delete" ON "public"."review" FOR DELETE USING (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "review_owner_insert" ON "public"."review" FOR INSERT WITH CHECK (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "review_owner_update" ON "public"."review" FOR UPDATE USING (("user_id" = "public"."current_app_user_id"())) WITH CHECK (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "review_public_read" ON "public"."review" FOR SELECT USING (true);



ALTER TABLE "public"."season" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "streamflix_admin_delete_genre" ON "public"."genre" FOR DELETE TO "app_admin" USING (true);



CREATE POLICY "streamflix_admin_delete_season" ON "public"."season" FOR DELETE TO "app_admin" USING (true);



CREATE POLICY "streamflix_admin_insert_genre" ON "public"."genre" FOR INSERT TO "app_admin" WITH CHECK (true);



CREATE POLICY "streamflix_admin_insert_season" ON "public"."season" FOR INSERT TO "app_admin" WITH CHECK (true);



CREATE POLICY "streamflix_admin_select_genre" ON "public"."genre" FOR SELECT TO "app_admin" USING (true);



CREATE POLICY "streamflix_admin_select_season" ON "public"."season" FOR SELECT TO "app_admin" USING (true);



CREATE POLICY "streamflix_admin_update_genre" ON "public"."genre" FOR UPDATE TO "app_admin" USING (true) WITH CHECK (true);



CREATE POLICY "streamflix_admin_update_season" ON "public"."season" FOR UPDATE TO "app_admin" USING (true) WITH CHECK (true);



CREATE POLICY "streamflix_editor_insert_episodes" ON "public"."episodes" FOR INSERT TO "streamflix_content_editor" WITH CHECK (true);



CREATE POLICY "streamflix_editor_insert_genre" ON "public"."genre" FOR INSERT TO "streamflix_content_editor" WITH CHECK (true);



CREATE POLICY "streamflix_editor_insert_season" ON "public"."season" FOR INSERT TO "streamflix_content_editor" WITH CHECK (true);



CREATE POLICY "streamflix_editor_read_content" ON "public"."content" FOR SELECT TO "streamflix_content_editor" USING (true);



CREATE POLICY "streamflix_editor_read_episodes" ON "public"."episodes" FOR SELECT TO "streamflix_content_editor" USING (true);



CREATE POLICY "streamflix_editor_read_genre" ON "public"."genre" FOR SELECT TO "streamflix_content_editor" USING (true);



CREATE POLICY "streamflix_editor_read_season" ON "public"."season" FOR SELECT TO "streamflix_content_editor" USING (true);



CREATE POLICY "streamflix_editor_update_content" ON "public"."content" FOR UPDATE TO "streamflix_content_editor" USING (true) WITH CHECK (true);



CREATE POLICY "streamflix_editor_update_episodes" ON "public"."episodes" FOR UPDATE TO "streamflix_content_editor" USING (true) WITH CHECK (true);



CREATE POLICY "streamflix_editor_update_genre" ON "public"."genre" FOR UPDATE TO "streamflix_content_editor" USING (true) WITH CHECK (true);



CREATE POLICY "streamflix_editor_update_season" ON "public"."season" FOR UPDATE TO "streamflix_content_editor" USING (true) WITH CHECK (true);



CREATE POLICY "streamflix_viewer_read_content" ON "public"."content" FOR SELECT TO "streamflix_viewer" USING (true);



CREATE POLICY "streamflix_viewer_read_episodes" ON "public"."episodes" FOR SELECT TO "streamflix_viewer" USING (true);



CREATE POLICY "streamflix_viewer_read_genre" ON "public"."genre" FOR SELECT TO "streamflix_viewer" USING (true);



CREATE POLICY "streamflix_viewer_read_season" ON "public"."season" FOR SELECT TO "streamflix_viewer" USING (true);



ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subscriptions_admin_delete" ON "public"."subscriptions" FOR DELETE TO "app_admin" USING (true);



CREATE POLICY "subscriptions_admin_insert" ON "public"."subscriptions" FOR INSERT TO "app_admin" WITH CHECK (true);



CREATE POLICY "subscriptions_admin_select" ON "public"."subscriptions" FOR SELECT TO "app_admin" USING (true);



CREATE POLICY "subscriptions_admin_update" ON "public"."subscriptions" FOR UPDATE TO "app_admin" USING (true) WITH CHECK (true);



CREATE POLICY "subscriptions_owner_insert" ON "public"."subscriptions" FOR INSERT WITH CHECK (("subscription_user_id" = "public"."current_app_user_id"()));



CREATE POLICY "subscriptions_owner_select" ON "public"."subscriptions" FOR SELECT USING (("subscription_user_id" = "public"."current_app_user_id"()));



CREATE POLICY "subscriptions_owner_update" ON "public"."subscriptions" FOR UPDATE USING (("subscription_user_id" = "public"."current_app_user_id"())) WITH CHECK (("subscription_user_id" = "public"."current_app_user_id"()));



CREATE POLICY "subscriptions_support_read" ON "public"."subscriptions" FOR SELECT TO "app_support" USING (true);



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_admin_delete" ON "public"."users" FOR DELETE TO "app_admin" USING (true);



CREATE POLICY "users_admin_insert" ON "public"."users" FOR INSERT TO "app_admin" WITH CHECK (true);



CREATE POLICY "users_admin_select" ON "public"."users" FOR SELECT TO "app_admin" USING (true);



CREATE POLICY "users_admin_update" ON "public"."users" FOR UPDATE TO "app_admin" USING (true) WITH CHECK (true);



CREATE POLICY "users_self_select" ON "public"."users" FOR SELECT USING (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "users_self_update" ON "public"."users" FOR UPDATE USING (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "users_support_read" ON "public"."users" FOR SELECT TO "app_support" USING (true);



CREATE POLICY "view-history_owner" ON "public"."view_history" FOR INSERT TO "authenticated" WITH CHECK (true);



ALTER TABLE "public"."view_history" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "view_history-owner" ON "public"."view_history" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."watch_list" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "watch_list_owner_delete" ON "public"."watch_list" FOR DELETE TO "authenticated" USING (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "watch_list_owner_insert" ON "public"."watch_list" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "watch_list_owner_select" ON "public"."watch_list" FOR SELECT TO "authenticated" USING (("user_id" = "public"."current_app_user_id"()));



CREATE POLICY "watch_list_owner_update" ON "public"."watch_list" FOR UPDATE TO "authenticated" USING (("user_id" = "public"."current_app_user_id"())) WITH CHECK (("user_id" = "public"."current_app_user_id"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "streamflix_viewer";
GRANT USAGE ON SCHEMA "public" TO "streamflix_content_editor";






















































































































































GRANT ALL ON PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_age_rating" "text") TO "anon";
GRANT ALL ON PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_age_rating" "text") TO "authenticated";
GRANT ALL ON PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_age_rating" "text") TO "service_role";



GRANT ALL ON PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_license_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_age_rating" "text") TO "anon";
GRANT ALL ON PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_license_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_age_rating" "text") TO "authenticated";
GRANT ALL ON PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_license_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_age_rating" "text") TO "service_role";



GRANT ALL ON PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_license_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_synopsis" "text", IN "p_age_rating" "text") TO "anon";
GRANT ALL ON PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_license_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_synopsis" "text", IN "p_age_rating" "text") TO "authenticated";
GRANT ALL ON PROCEDURE "public"."add_content"(IN "p_title" "text", IN "p_type" "text", IN "p_genre_id" bigint, IN "p_license_id" bigint, IN "p_description" "text", IN "p_release_date" "date", IN "p_director" "text", IN "p_synopsis" "text", IN "p_age_rating" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."current_app_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_app_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_app_user_id"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_review_date"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_review_date"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_review_date"() TO "service_role";


















GRANT ALL ON TABLE "public"."content" TO "anon";
GRANT ALL ON TABLE "public"."content" TO "authenticated";
GRANT ALL ON TABLE "public"."content" TO "service_role";
GRANT ALL ON TABLE "public"."content" TO "app_admin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."content" TO "app_content_manager";
GRANT SELECT ON TABLE "public"."content" TO "app_subscriber";
GRANT SELECT ON TABLE "public"."content" TO "streamflix_viewer";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."content" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."content_license" TO "anon";
GRANT ALL ON TABLE "public"."content_license" TO "authenticated";
GRANT ALL ON TABLE "public"."content_license" TO "service_role";
GRANT ALL ON TABLE "public"."content_license" TO "app_admin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."content_license" TO "app_content_manager";
GRANT SELECT ON TABLE "public"."content_license" TO "app_subscriber";
GRANT SELECT ON TABLE "public"."content_license" TO "streamflix_viewer";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."content_license" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."genre" TO "anon";
GRANT ALL ON TABLE "public"."genre" TO "authenticated";
GRANT ALL ON TABLE "public"."genre" TO "service_role";
GRANT ALL ON TABLE "public"."genre" TO "app_admin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."genre" TO "app_content_manager";
GRANT SELECT ON TABLE "public"."genre" TO "app_subscriber";
GRANT SELECT ON TABLE "public"."genre" TO "streamflix_viewer";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."genre" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."content_catalog" TO "anon";
GRANT ALL ON TABLE "public"."content_catalog" TO "authenticated";
GRANT ALL ON TABLE "public"."content_catalog" TO "service_role";



GRANT ALL ON SEQUENCE "public"."content_content_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."content_content_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."content_content_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."content_content_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."content_content_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."content_content_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."content_content_id_seq" TO "streamflix_content_editor";



GRANT ALL ON SEQUENCE "public"."content_license_license_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."content_license_license_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."content_license_license_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."content_license_license_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."content_license_license_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."content_license_license_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."content_license_license_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."episodes" TO "anon";
GRANT ALL ON TABLE "public"."episodes" TO "authenticated";
GRANT ALL ON TABLE "public"."episodes" TO "service_role";
GRANT ALL ON TABLE "public"."episodes" TO "app_admin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."episodes" TO "app_content_manager";
GRANT SELECT ON TABLE "public"."episodes" TO "app_subscriber";
GRANT SELECT ON TABLE "public"."episodes" TO "streamflix_viewer";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."episodes" TO "streamflix_content_editor";



GRANT ALL ON SEQUENCE "public"."episodes_episode_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."episodes_episode_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."episodes_episode_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."episodes_episode_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."episodes_episode_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."episodes_episode_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."episodes_episode_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";
GRANT ALL ON TABLE "public"."favorites" TO "app_admin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."favorites" TO "app_subscriber";



GRANT ALL ON SEQUENCE "public"."favorites_fav_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."favorites_fav_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."favorites_fav_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."favorites_fav_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."favorites_fav_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."favorites_fav_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."favorites_fav_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";
GRANT ALL ON TABLE "public"."feedback" TO "app_admin";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."feedback" TO "app_support";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."feedback" TO "app_subscriber";



GRANT ALL ON SEQUENCE "public"."feedback_feedback_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."feedback_feedback_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."feedback_feedback_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."feedback_feedback_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."feedback_feedback_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."feedback_feedback_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."feedback_feedback_id_seq" TO "streamflix_content_editor";



GRANT ALL ON SEQUENCE "public"."genre_genre_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."genre_genre_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."genre_genre_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."genre_genre_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."genre_genre_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."genre_genre_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."genre_genre_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."members" TO "anon";
GRANT ALL ON TABLE "public"."members" TO "authenticated";
GRANT ALL ON TABLE "public"."members" TO "service_role";
GRANT ALL ON TABLE "public"."members" TO "app_admin";
GRANT SELECT ON TABLE "public"."members" TO "app_support";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."members" TO "app_subscriber";



GRANT ALL ON SEQUENCE "public"."members_member_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."members_member_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."members_member_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."members_member_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."members_member_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."members_member_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."members_member_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."merchandise_product" TO "anon";
GRANT ALL ON TABLE "public"."merchandise_product" TO "authenticated";
GRANT ALL ON TABLE "public"."merchandise_product" TO "service_role";
GRANT ALL ON TABLE "public"."merchandise_product" TO "app_admin";
GRANT SELECT ON TABLE "public"."merchandise_product" TO "app_subscriber";



GRANT ALL ON SEQUENCE "public"."merchandise_product_product_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."merchandise_product_product_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."merchandise_product_product_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."merchandise_product_product_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."merchandise_product_product_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."merchandise_product_product_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."merchandise_product_product_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."merchandise_transaction" TO "anon";
GRANT ALL ON TABLE "public"."merchandise_transaction" TO "authenticated";
GRANT ALL ON TABLE "public"."merchandise_transaction" TO "service_role";
GRANT ALL ON TABLE "public"."merchandise_transaction" TO "app_admin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."merchandise_transaction" TO "app_subscriber";



GRANT ALL ON SEQUENCE "public"."merchandise_transaction_transaction_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."merchandise_transaction_transaction_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."merchandise_transaction_transaction_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."merchandise_transaction_transaction_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."merchandise_transaction_transaction_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."merchandise_transaction_transaction_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."merchandise_transaction_transaction_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";
GRANT ALL ON TABLE "public"."plans" TO "app_admin";
GRANT SELECT ON TABLE "public"."plans" TO "app_support";
GRANT SELECT ON TABLE "public"."plans" TO "app_subscriber";
GRANT SELECT ON TABLE "public"."plans" TO "streamflix_viewer";



GRANT ALL ON SEQUENCE "public"."plans_plan_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."plans_plan_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."plans_plan_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."plans_plan_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."plans_plan_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."plans_plan_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."plans_plan_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT ALL ON TABLE "public"."profiles" TO "app_admin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."profiles" TO "app_subscriber";



GRANT ALL ON SEQUENCE "public"."profiles_profile_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profiles_profile_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profiles_profile_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."profiles_profile_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."profiles_profile_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."profiles_profile_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."profiles_profile_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."review" TO "anon";
GRANT ALL ON TABLE "public"."review" TO "authenticated";
GRANT ALL ON TABLE "public"."review" TO "service_role";
GRANT ALL ON TABLE "public"."review" TO "app_admin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."review" TO "app_subscriber";



GRANT ALL ON SEQUENCE "public"."review_review_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."review_review_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."review_review_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."review_review_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."review_review_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."review_review_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."review_review_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."season" TO "anon";
GRANT ALL ON TABLE "public"."season" TO "authenticated";
GRANT ALL ON TABLE "public"."season" TO "service_role";
GRANT ALL ON TABLE "public"."season" TO "app_admin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."season" TO "app_content_manager";
GRANT SELECT ON TABLE "public"."season" TO "app_subscriber";
GRANT SELECT ON TABLE "public"."season" TO "streamflix_viewer";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."season" TO "streamflix_content_editor";



GRANT ALL ON SEQUENCE "public"."season_season_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."season_season_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."season_season_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."season_season_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."season_season_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."season_season_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."season_season_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";
GRANT ALL ON TABLE "public"."subscriptions" TO "app_admin";
GRANT SELECT ON TABLE "public"."subscriptions" TO "app_support";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."subscriptions" TO "app_subscriber";



GRANT ALL ON SEQUENCE "public"."subscriptions_subscription_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."subscriptions_subscription_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."subscriptions_subscription_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."subscriptions_subscription_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."subscriptions_subscription_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."subscriptions_subscription_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."subscriptions_subscription_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";
GRANT ALL ON TABLE "public"."users" TO "app_admin";
GRANT SELECT ON TABLE "public"."users" TO "app_content_manager";
GRANT SELECT ON TABLE "public"."users" TO "app_support";
GRANT SELECT,UPDATE ON TABLE "public"."users" TO "app_subscriber";



GRANT ALL ON SEQUENCE "public"."users_user_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_user_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_user_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."users_user_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."users_user_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."users_user_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."users_user_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."view_history" TO "anon";
GRANT ALL ON TABLE "public"."view_history" TO "authenticated";
GRANT ALL ON TABLE "public"."view_history" TO "service_role";
GRANT ALL ON TABLE "public"."view_history" TO "app_admin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."view_history" TO "app_subscriber";



GRANT ALL ON SEQUENCE "public"."view_history_history_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."view_history_history_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."view_history_history_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."view_history_history_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."view_history_history_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."view_history_history_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."view_history_history_id_seq" TO "streamflix_content_editor";



GRANT ALL ON TABLE "public"."watch_list" TO "anon";
GRANT ALL ON TABLE "public"."watch_list" TO "authenticated";
GRANT ALL ON TABLE "public"."watch_list" TO "service_role";
GRANT ALL ON TABLE "public"."watch_list" TO "app_admin";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."watch_list" TO "app_subscriber";



GRANT ALL ON SEQUENCE "public"."watch_list_list_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."watch_list_list_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."watch_list_list_id_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."watch_list_list_id_seq" TO "app_admin";
GRANT SELECT,USAGE ON SEQUENCE "public"."watch_list_list_id_seq" TO "app_content_manager";
GRANT SELECT,USAGE ON SEQUENCE "public"."watch_list_list_id_seq" TO "app_subscriber";
GRANT SELECT,USAGE ON SEQUENCE "public"."watch_list_list_id_seq" TO "streamflix_content_editor";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































