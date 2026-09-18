SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict yYbJvk1GQuxuMeDs3Xck7L4hHWz9UeIRgaoIM1OoZhbQas2O2Jxjp1YNo5FlpWc

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."custom_oauth_providers" ("id", "provider_type", "identifier", "name", "client_id", "client_secret", "acceptable_client_ids", "scopes", "pkce_enabled", "attribute_mapping", "authorization_params", "enabled", "email_optional", "issuer", "discovery_url", "skip_nonce_check", "cached_discovery", "discovery_cached_at", "authorization_url", "token_url", "userinfo_url", "jwks_uri", "created_at", "updated_at", "custom_claims_allowlist") FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") FROM stdin;
00000000-0000-0000-0000-000000000000	a1111111-1111-1111-1111-111111111111	authenticated	authenticated	maria.santos@example.com	$2a$06$Q.zHXI2nEWZMq8buGwRRyuZwy7FZY.6JBRZpHRTLS0orRAtshbj2G	2026-09-11 11:09:20.238829+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email"}	{}	\N	2026-09-11 11:09:20.238829+00	2026-09-11 11:09:20.238829+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a2222222-2222-2222-2222-222222222222	authenticated	authenticated	john.reyes@example.com	$2a$06$1j8zQIuh3ZxzMt4VgnZe0u8V/7ZW5o2Qkjjm0TycCl44dJgNQKkDO	2026-09-11 11:09:20.238829+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email"}	{}	\N	2026-09-11 11:09:20.238829+00	2026-09-11 11:09:20.238829+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a3333333-3333-3333-3333-333333333333	authenticated	authenticated	ana.cruz@example.com	$2a$06$RhD.1CN/Dgb5DN7OJcBcyuOZdpaJUUitMWCTg2QVcBBzcZqYOHB6W	2026-09-11 11:09:20.238829+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email"}	{}	\N	2026-09-11 11:09:20.238829+00	2026-09-11 11:09:20.238829+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a4444444-4444-4444-4444-444444444444	authenticated	authenticated	carlo.dizon@example.com	$2a$06$ypEGNBNX8NtRZiWIQxG7bup/7QoSt2EfnvaTUn.YW6lIUdiPXMeO2	2026-09-11 11:09:20.238829+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email"}	{}	\N	2026-09-11 11:09:20.238829+00	2026-09-11 11:09:20.238829+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a5555555-5555-5555-5555-555555555555	authenticated	authenticated	bea.torres@example.com	$2a$06$51aW32ODORshfj5L9Mt67OLzVMoHG2TPH9exqSKS9/kw1RAOfZj4O	2026-09-11 11:09:20.238829+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email"}	{}	\N	2026-09-11 11:09:20.238829+00	2026-09-11 11:09:20.238829+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a6666666-6666-6666-6666-666666666666	authenticated	authenticated	miguel.santos@example.com	$2a$06$LVS91HZRSTbfFta8sfem.OG5AzgB6733Uu06EWAXLo3Jma1jqt6yy	2026-09-11 11:09:20.238829+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email"}	{}	\N	2026-09-11 11:09:20.238829+00	2026-09-11 11:09:20.238829+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a7777777-7777-7777-7777-777777777777	authenticated	authenticated	liza.ramos@example.com	$2a$06$7IGxs5JDp/LQbJGryZcUm.w.v4Vmnr7AiialKot5fuF7tnRmSqAMm	2026-09-11 11:09:20.238829+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email"}	{}	\N	2026-09-11 11:09:20.238829+00	2026-09-11 11:09:20.238829+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a8888888-8888-8888-8888-888888888888	authenticated	authenticated	paolo.garcia@example.com	$2a$06$9SvXvIPPUgeeqWg2ZSVftuM1Rj4TflmWc14q7PpEAwMffQCdK5AhK	2026-09-11 11:09:20.238829+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email"}	{}	\N	2026-09-11 11:09:20.238829+00	2026-09-11 11:09:20.238829+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a9999999-9999-9999-9999-999999999999	authenticated	authenticated	nadia.lim@example.com	$2a$06$/KDhCuxZYVYFZcdugIqSqe3E8p0qyvaESJt1dJA.y0qOOJAOmFXXi	2026-09-11 11:09:20.238829+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email"}	{}	\N	2026-09-11 11:09:20.238829+00	2026-09-11 11:09:20.238829+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b1111111-1111-1111-1111-111111111111	authenticated	authenticated	ronan.aquino@example.com	$2a$06$eCWohwSWVNjrQ..YHYn4suourCAni90CnQT4gAxk.MSJtcMF.2iSa	2026-09-11 11:09:20.238829+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email"}	{}	\N	2026-09-11 11:09:20.238829+00	2026-09-11 11:09:20.238829+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b2222222-2222-2222-2222-222222222222	authenticated	authenticated	ivy.mendoza@example.com	$2a$06$cM8sZTpeT8kDbL6A8XcuIO.Gf1c/sTSRjqBaPXxdcnUUP/0vL9Zhu	2026-09-11 11:09:20.238829+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email"}	{}	\N	2026-09-11 11:09:20.238829+00	2026-09-11 11:09:20.238829+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b3333333-3333-3333-3333-333333333333	authenticated	authenticated	admin@streamflix.com	$2a$06$KXAl5aUfBA1jBSALHhnn/eJIZfXFbONTXClExvGvC20D0kd1IMX5i	2026-09-11 11:09:20.238829+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"provider": "email"}	{}	\N	2026-09-11 11:09:20.238829+00	2026-09-11 11:09:20.238829+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ffdcc078-8d35-49bb-a3d8-dfec832663e0	authenticated	authenticated	testuser123@gmail.com	$2a$10$BSzApn/iIJCZmlcHW8AyCeXIn9DfsFZBjnoY6x4yQR2p2ACvhSmIC	\N	\N	7e835b1ecc2096b3767c4dfb91c874037fccde2477669fb00cbf3ab9	2026-09-13 09:27:09.577469+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"sub": "ffdcc078-8d35-49bb-a3d8-dfec832663e0", "email": "testuser123@gmail.com", "full_name": "Test User", "email_verified": false, "phone_verified": false}	\N	2026-09-13 09:27:09.572448+00	2026-09-13 09:27:10.858048+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	15d8f6b1-c6ba-4262-b147-69adfb610fca	authenticated	authenticated	castelochristopher00@gmail.com	$2a$10$bcKOgM.DeCDlRICYmPmcD.y2kmBhcJM7XS1IVYOiJwl3pXKTGmrbq	2026-09-17 21:19:37.883144+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-09-17 21:19:37.850594+00	2026-09-17 21:19:37.884191+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	authenticated	authenticated	testuser1@gmail.com	$2a$10$pzRp5ddr/thvIxbn1rKabel0uDx.0aQI2ZfP7QHDTv0LLBMKxeFni	2026-09-13 09:56:36.652441+00	\N		\N		\N			\N	2026-09-14 09:29:28.952428+00	{"provider": "email", "providers": ["email"]}	{"sub": "bcb327ac-c3c9-4e66-8deb-a87da2daa4b6", "email": "testuser1@gmail.com", "full_name": "User", "email_verified": true, "phone_verified": false}	\N	2026-09-13 09:56:36.62852+00	2026-09-14 09:29:28.972728+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") FROM stdin;
ffdcc078-8d35-49bb-a3d8-dfec832663e0	ffdcc078-8d35-49bb-a3d8-dfec832663e0	{"sub": "ffdcc078-8d35-49bb-a3d8-dfec832663e0", "email": "testuser123@gmail.com", "full_name": "Test User", "email_verified": false, "phone_verified": false}	email	2026-09-13 09:27:09.575152+00	2026-09-13 09:27:09.575194+00	2026-09-13 09:27:09.575194+00	17c869f7-3112-402b-8cd9-5ef4f7bacc26
bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	{"sub": "bcb327ac-c3c9-4e66-8deb-a87da2daa4b6", "email": "testuser1@gmail.com", "full_name": "User", "email_verified": false, "phone_verified": false}	email	2026-09-13 09:56:36.646684+00	2026-09-13 09:56:36.646732+00	2026-09-13 09:56:36.646732+00	3386d29b-508b-4211-8886-478fc407134c
15d8f6b1-c6ba-4262-b147-69adfb610fca	15d8f6b1-c6ba-4262-b147-69adfb610fca	{"sub": "15d8f6b1-c6ba-4262-b147-69adfb610fca", "email": "castelochristopher00@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-09-17 21:19:37.867907+00	2026-09-17 21:19:37.86796+00	2026-09-17 21:19:37.86796+00	c1c10e31-49af-4f2b-8032-3bd29c06e9fa
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."instances" ("id", "uuid", "raw_base_config", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_clients" ("id", "client_secret_hash", "registration_type", "redirect_uris", "grant_types", "client_name", "client_uri", "logo_uri", "created_at", "updated_at", "deleted_at", "client_type", "token_endpoint_auth_method") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") FROM stdin;
d26f5499-1afb-46db-8aa5-af2b484a1fce	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	2026-09-13 09:56:36.657715+00	2026-09-13 09:56:36.657715+00	\N	aal1	\N	\N	node	103.41.9.34	\N	\N	\N	\N	\N
8ea70b41-b8c6-4c88-8f25-c53c692663ee	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	2026-09-13 09:58:52.364339+00	2026-09-13 09:58:52.364339+00	\N	aal1	\N	\N	node	103.41.9.34	\N	\N	\N	\N	\N
9a789987-e476-4d31-84db-1c1121379796	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	2026-09-13 10:02:41.025441+00	2026-09-13 11:00:57.314675+00	\N	aal1	\N	2026-09-13 11:00:57.314564	node	103.41.9.34	\N	\N	\N	\N	\N
9650f992-607a-4032-b0c6-99242838d912	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	2026-09-13 11:25:42.619+00	2026-09-13 11:25:42.619+00	\N	aal1	\N	\N	node	103.41.9.30	\N	\N	\N	\N	\N
280e81f1-b6fd-46fc-8c1a-e82faa565b4a	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	2026-09-13 11:33:06.632818+00	2026-09-13 11:33:06.632818+00	\N	aal1	\N	\N	node	103.41.9.30	\N	\N	\N	\N	\N
2ee73a40-ea3c-4378-bd13-835d5c6c89be	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	2026-09-13 11:33:07.092196+00	2026-09-13 16:25:33.014584+00	\N	aal1	\N	2026-09-13 16:25:33.01445	node	103.41.9.30	\N	\N	\N	\N	\N
a3ac9667-a20c-4c31-b1c2-fb74df87a259	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	2026-09-14 09:21:20.459038+00	2026-09-14 09:21:20.459038+00	\N	aal1	\N	\N	node	103.41.9.30	\N	\N	\N	\N	\N
8ed1310a-3c65-4637-b4d2-30dc743ec02d	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	2026-09-14 09:29:28.954387+00	2026-09-14 09:29:28.954387+00	\N	aal1	\N	\N	node	103.41.9.30	\N	\N	\N	\N	\N
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") FROM stdin;
d26f5499-1afb-46db-8aa5-af2b484a1fce	2026-09-13 09:56:36.67365+00	2026-09-13 09:56:36.67365+00	password	a83272e2-5f6a-493f-b60e-7a8d5e8ad754
8ea70b41-b8c6-4c88-8f25-c53c692663ee	2026-09-13 09:58:52.372576+00	2026-09-13 09:58:52.372576+00	password	c67651c8-976d-4d76-b3e1-1c344bf5bcda
9a789987-e476-4d31-84db-1c1121379796	2026-09-13 10:02:41.037872+00	2026-09-13 10:02:41.037872+00	password	d8f6161c-79de-4282-bb84-41952b8f19cc
9650f992-607a-4032-b0c6-99242838d912	2026-09-13 11:25:42.649981+00	2026-09-13 11:25:42.649981+00	password	ca90da42-338e-4dbe-8f3a-ef262ec7927c
280e81f1-b6fd-46fc-8c1a-e82faa565b4a	2026-09-13 11:33:06.679567+00	2026-09-13 11:33:06.679567+00	password	818e56d1-63f6-4e2e-8788-09ed6af0bc01
2ee73a40-ea3c-4378-bd13-835d5c6c89be	2026-09-13 11:33:07.100387+00	2026-09-13 11:33:07.100387+00	password	882140fa-307f-4595-adde-9065a45a6ceb
a3ac9667-a20c-4c31-b1c2-fb74df87a259	2026-09-14 09:21:20.503405+00	2026-09-14 09:21:20.503405+00	password	04a3e192-09cc-40d0-8019-5cb9630d6f14
8ed1310a-3c65-4637-b4d2-30dc743ec02d	2026-09-14 09:29:28.976772+00	2026-09-14 09:29:28.976772+00	password	c624f32f-450a-488e-8560-15eff1cdd246
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_factors" ("id", "user_id", "friendly_name", "factor_type", "status", "created_at", "updated_at", "secret", "phone", "last_challenged_at", "web_authn_credential", "web_authn_aaguid", "last_webauthn_challenge_data") FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_challenges" ("id", "factor_id", "created_at", "verified_at", "ip_address", "otp_code", "web_authn_session_data") FROM stdin;
\.


--
-- Data for Name: mfa_recovery_code_sets; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_recovery_code_sets" ("id", "user_id", "mfa_factor_id", "failed_verification_count", "verification_locked_until", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: mfa_recovery_codes; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_recovery_codes" ("id", "mfa_recovery_code_set_id", "code_hash", "consumed_at", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_authorizations" ("id", "authorization_id", "client_id", "user_id", "redirect_uri", "scope", "state", "resource", "code_challenge", "code_challenge_method", "response_type", "status", "authorization_code", "created_at", "expires_at", "approved_at", "nonce") FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_client_states" ("id", "provider_type", "code_verifier", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_consents" ("id", "user_id", "client_id", "scopes", "granted_at", "revoked_at") FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at", "expires_at") FROM stdin;
e16bbcaa-9adb-4df5-bc89-22af8c5c747d	ffdcc078-8d35-49bb-a3d8-dfec832663e0	confirmation_token	7e835b1ecc2096b3767c4dfb91c874037fccde2477669fb00cbf3ab9	testuser123@gmail.com	2026-09-13 09:27:10.863407	2026-09-13 09:27:10.863407	\N
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") FROM stdin;
00000000-0000-0000-0000-000000000000	1	d7bzsmbi2yfj	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	f	2026-09-13 09:56:36.664143+00	2026-09-13 09:56:36.664143+00	\N	d26f5499-1afb-46db-8aa5-af2b484a1fce
00000000-0000-0000-0000-000000000000	2	cpcwaswswgci	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	f	2026-09-13 09:58:52.368752+00	2026-09-13 09:58:52.368752+00	\N	8ea70b41-b8c6-4c88-8f25-c53c692663ee
00000000-0000-0000-0000-000000000000	3	vsnkvp7tpfob	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	t	2026-09-13 10:02:41.029244+00	2026-09-13 11:00:57.297822+00	\N	9a789987-e476-4d31-84db-1c1121379796
00000000-0000-0000-0000-000000000000	4	57o2uanrja4m	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	f	2026-09-13 11:00:57.307143+00	2026-09-13 11:00:57.307143+00	vsnkvp7tpfob	9a789987-e476-4d31-84db-1c1121379796
00000000-0000-0000-0000-000000000000	5	irm3bijlbu65	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	f	2026-09-13 11:25:42.632799+00	2026-09-13 11:25:42.632799+00	\N	9650f992-607a-4032-b0c6-99242838d912
00000000-0000-0000-0000-000000000000	6	tfcpl7fwmj4h	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	f	2026-09-13 11:33:06.658703+00	2026-09-13 11:33:06.658703+00	\N	280e81f1-b6fd-46fc-8c1a-e82faa565b4a
00000000-0000-0000-0000-000000000000	7	llbs5hu7u77b	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	t	2026-09-13 11:33:07.097412+00	2026-09-13 12:31:28.897843+00	\N	2ee73a40-ea3c-4378-bd13-835d5c6c89be
00000000-0000-0000-0000-000000000000	8	oznrpvd7waz7	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	t	2026-09-13 12:31:28.90824+00	2026-09-13 13:29:59.918485+00	llbs5hu7u77b	2ee73a40-ea3c-4378-bd13-835d5c6c89be
00000000-0000-0000-0000-000000000000	9	gsrwlp3ltcgt	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	t	2026-09-13 13:29:59.929768+00	2026-09-13 14:28:31.184776+00	oznrpvd7waz7	2ee73a40-ea3c-4378-bd13-835d5c6c89be
00000000-0000-0000-0000-000000000000	10	5mjcverlh545	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	t	2026-09-13 14:28:31.199478+00	2026-09-13 15:27:03.203088+00	gsrwlp3ltcgt	2ee73a40-ea3c-4378-bd13-835d5c6c89be
00000000-0000-0000-0000-000000000000	11	nd2mqtelzfff	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	t	2026-09-13 15:27:03.214344+00	2026-09-13 16:25:32.976099+00	5mjcverlh545	2ee73a40-ea3c-4378-bd13-835d5c6c89be
00000000-0000-0000-0000-000000000000	12	7pdmupzfzu3n	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	f	2026-09-13 16:25:32.989561+00	2026-09-13 16:25:32.989561+00	nd2mqtelzfff	2ee73a40-ea3c-4378-bd13-835d5c6c89be
00000000-0000-0000-0000-000000000000	13	v4mojzldaagl	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	f	2026-09-14 09:21:20.482726+00	2026-09-14 09:21:20.482726+00	\N	a3ac9667-a20c-4c31-b1c2-fb74df87a259
00000000-0000-0000-0000-000000000000	14	z3s42gv34jdr	bcb327ac-c3c9-4e66-8deb-a87da2daa4b6	f	2026-09-14 09:29:28.9699+00	2026-09-14 09:29:28.9699+00	\N	8ed1310a-3c65-4637-b4d2-30dc743ec02d
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_providers" ("id", "resource_id", "created_at", "updated_at", "disabled") FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_providers" ("id", "sso_provider_id", "entity_id", "metadata_xml", "metadata_url", "attribute_mapping", "created_at", "updated_at", "name_id_format") FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_relay_states" ("id", "sso_provider_id", "request_id", "for_email", "redirect_to", "created_at", "updated_at", "flow_state_id") FROM stdin;
\.


--
-- Data for Name: scim_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."scim_tokens" ("id", "sso_provider_id", "token_hash", "prefix", "created_at", "expires_at", "revoked_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: scim_users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."scim_users" ("id", "sso_provider_id", "user_id", "resource", "created_at", "updated_at", "deleted_at") FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_domains" ("id", "sso_provider_id", "domain", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_challenges" ("id", "user_id", "challenge_type", "session_data", "created_at", "expires_at") FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_credentials" ("id", "user_id", "credential_id", "public_key", "attestation_type", "aaguid", "sign_count", "transports", "backup_eligible", "backed_up", "friendly_name", "created_at", "updated_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: content_license; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."content_license" ("license_id", "licensor_name", "expiration_date", "region") FROM stdin;
1	Warner Bros. Pictures	2027-12-31	Worldwide
2	Universal Studios	2026-06-30	Worldwide
3	Legendary Pictures	2027-03-15	North America
4	Netflix Studios	2028-01-01	Worldwide
5	A24	2026-11-01	North America, Europe
6	Sony Pictures	2027-08-20	Worldwide
7	Paramount Pictures	2026-09-30	Worldwide
8	HBO Originals	2028-05-01	Worldwide
9	Blumhouse Productions	2026-10-31	North America
10	Amblin Entertainment	2027-07-01	Worldwide
11	20th Century Studios	2027-02-28	Worldwide
12	Pixar Animation Studios	2028-03-01	Worldwide
\.


--
-- Data for Name: genre; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."genre" ("genre_id", "genre_name") FROM stdin;
1	Action
2	Sci-Fi
3	Drama
4	Comedy
5	Horror
6	Romance
7	Fantasy
8	Thriller
9	Animation
10	Documentary
11	Crime
12	Adventure
\.


--
-- Data for Name: content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."content" ("content_id", "genre_id", "license_id", "title", "description", "release_date", "director", "cast_info", "synopsis", "type", "age_rating", "created_at", "deleted_at", "trailer_url") FROM stdin;
1	2	4	Security Test	The Avengers assemble once more to undo the Snap.	2019-04-26	Anthony & Joe Russo	Robert Downey Jr., Chris Evans, Scarlett Johansson	After Thanos wipes out half of all life, the remaining Avengers mount a final stand.	movie	PG-13	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Avengers%20Endgame.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9BdmVuZ2VycyBFbmRnYW1lLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODk2OTgzMDIsImV4cCI6MTg1Mjc3MDMwMn0.ZNFeJ8jRP_By3xw5dsA3UI65B9feIMt-YSAm9yKYZZKtj9K8L-q6ab9bZO9ha0Sbt2IuSfsYGVFGeL96Y0jd7Q
2	1	1	Batman: Dark Knight Trilogy	Christopher Nolan's complete Batman saga.	2005-06-15	Christopher Nolan	Christian Bale, Heath Ledger, Aaron Eckhart	Bruce Wayne's rise as Gotham's protector across three films.	movie	PG-13	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/The%20Dark%20Knight%20Rises%20Ultimate%20Trilogy%20Trailer%20-%20Christopher%20Nolan%20Batman%20Movie%20Legacy%20HD%20-%20Rotten%20Tomatoes%20Trailers%20(144p).mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9UaGUgRGFyayBLbmlnaHQgUmlzZXMgVWx0aW1hdGUgVHJpbG9neSBUcmFpbGVyIC0gQ2hyaXN0b3BoZXIgTm9sYW4gQmF0bWFuIE1vdmllIExlZ2FjeSBIRCAtIFJvdHRlbiBUb21hdG9lcyBUcmFpbGVycyAoMTQ0cCkubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTcwNjc4OCwiZXhwIjoxOTQ3Mzg2Nzg4fQ.cmnGkvp82pVh5e04OZ495eEE3GltVPZOGqmZ1D-XQ_u-lIxrokk-0WRGJ-cfXRsmpfNmOTRrqSvfXSpo52SIGw
3	6	4	Bridgerton	Regency-era romance among London's elite families.	2020-12-25	Chris Van Dusen	Phoebe Dynevor, Rege-Jean Page	The Bridgerton siblings navigate love and scandal in high society.	series	TV-MA	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Bridgerton%20Official%20Trailer%20Netflix%20-%20Netflix%20(144p).mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9CcmlkZ2VydG9uIE9mZmljaWFsIFRyYWlsZXIgTmV0ZmxpeCAtIE5ldGZsaXggKDE0NHApLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODk2ODA2OTAsImV4cCI6MTgyMTIxNjY5MH0.Cdlf5ynfCb7aYdX8scywLJ5AhC7ZTV3ahjZaHOBk-_mTCKJQstcxKwYl-65eAiLq_8ahx7gDZkUoY70z_MGO_g
7	8	6	Friday	A day in the life of two friends in South Central LA.	1995-04-26	F. Gary Gray	Ice Cube, Chris Tucker	Craig and Smokey navigate one wild Friday.	movie	R	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Friday.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9GcmlkYXkubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTcwNzA2NywiZXhwIjoxOTQ3Mzg3MDY3fQ.vb2mLR46M5e3CwbjpK9H-geVci8Fx8kPNeV3J4tQnVU0-FMB_-8gQKtblFGomFrXTmTgxCgnvs_P2sUpwsZnlQ
11	1	6	John Wick: Chapter 4	Wick fights his way through the High Table's hierarchy.	2023-03-24	Chad Stahelski	Keanu Reeves, Donnie Yen	John Wick uncovers a path to defeating the High Table.	movie	R	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/John%20Wick%20Chapter%204.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9Kb2huIFdpY2sgQ2hhcHRlciA0Lm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODk3MDc0MzYsImV4cCI6MTk0NzM4NzQzNn0.-9j7BWF84uHzUISV6N2gV-mFZPAoGGZWTXjugu78iFqvJiLQMyWahRdj9Wobmy97EEIXnqQO4-glTVEZbhXEfg
14	9	12	Minions and Monsters	A minion team-up adventure with a monster twist.	2025-06-20	Kyle Balda	Steve Carell, Pierre Coffin	The Minions face off against a horde of friendly monsters.	movie	PG	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Minions%20and%20Monsters.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9NaW5pb25zIGFuZCBNb25zdGVycy5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NzA3NTY2LCJleHAiOjE5NDczODc1NjZ9.wabY-ehbgShGwL1e145YY_n_CzLAzf7mMrR9zN1Ph1R7bXBuVDBbs5pyhb9NeVQp6Ota5O2OwmvMdD0JcRdgzA
17	2	4	Project Hail Mary	A lone astronaut must save humanity from extinction.	2026-03-20	Phil Lord & Christopher Miller	Ryan Gosling	A reluctant astronaut wakes up on a solo mission to save Earth.	movie	PG-13	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Project%20Hail%20Mary.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9Qcm9qZWN0IEhhaWwgTWFyeS5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NzA4NDc1LCJleHAiOjE5NDczODg0NzV9.Otg22P0AWM2cA2Lhq8AmMYRrwck2AAE9tfg4VXelz8_sxr8HGpWiuGNlVke45CPHlulIwB6FAfBfbhpMAGWE8g
20	4	6	The Fall Guy	A stuntman gets drawn into a Hollywood conspiracy.	2024-05-03	David Leitch	Ryan Gosling, Emily Blunt	A stunt double investigates the disappearance of a movie star.	movie	PG-13	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/The%20Fall%20Guy%20Official%20Trailer%20-%20Universal%20Pictures%20(144p).mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9UaGUgRmFsbCBHdXkgT2ZmaWNpYWwgVHJhaWxlciAtIFVuaXZlcnNhbCBQaWN0dXJlcyAoMTQ0cCkubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTcwODU5NCwiZXhwIjoxOTQ3Mzg4NTk0fQ.oE7yzh-uuRSuXV2GeD0yyAPkNhzg9AKV-g1vDU0Z5wMeH5dcd49Udx0U972VD-h7rXSUE7RiTnrIi2K0DvoyXw
22	6	1	The Notebook	A romance that spans decades, told through memory.	2004-06-25	Nick Cassavetes	Ryan Gosling, Rachel McAdams	An elderly man reads a love story to a woman with memory loss.	movie	PG-13	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/The%20Notebook.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9UaGUgTm90ZWJvb2subXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTcwOTIyNywiZXhwIjoxOTQ3Mzg5MjI3fQ.LqM9SuEDARVA-_KIM3gb-fU8zpuymNMmzS5Y4G-lGc7bCr_hm66KAa_Y_6TXN23jS2lu5IybrBGWmtLRviicvA
25	7	4	The Witcher	A monster hunter finds his destiny tied to a princess.	2019-12-20	Lauren Schmidt Hissrich	Henry Cavill	Geralt of Rivia navigates a world where people are often more wicked than beasts.	series	TV-MA	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/The%20Witcher.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9UaGUgV2l0Y2hlci5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NzA5MzM3LCJleHAiOjE5NDczODkzMzd9.JhJFSRVW8CQK2KB4JKKki4HAbzWuKogOOwVZZellJ5IAnw8WTktaZmT1FMvwpENRP_Dyb4wx9KstCmhRcqfTQA
33	1	1	CRUD Test Movie	Test content created using a stored procedure.	2026-09-16	Test Director	\N	A test movie created to demonstrate the StreamFlix stored procedure.	movie	PG-13	2026-09-15 17:17:07.417125+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Simple%20CRUD%20Application%20-%20For%20Test%20Only%20-%20rikoari%20(144p).mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9TaW1wbGUgQ1JVRCBBcHBsaWNhdGlvbiAtIEZvciBUZXN0IE9ubHkgLSByaWtvYXJpICgxNDRwKS5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NzEwMjI1LCJleHAiOjE5NDczOTAyMjV9.fn3vv-1FSOWCPIBHNC5cNjnKKjqjv6_ZSW7ztWkyRZ8XwWvjqivheGk4N7ibQS4EVR9Qs-VZZk5LyNvfa2MZpg
5	1	2	Deadpool	The wisecracking mercenary gets his own movie.	2016-02-12	Tim Miller	Ryan Reynolds, Morena Baccarin	A disfigured mercenary hunts down the man who ruined his life.	movie	R	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Deadpool.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9EZWFkcG9vbC5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5Njk4NTMzLCJleHAiOjE5NDczNzg1MzN9.VXM-WOEZ5-6KtNo_FX-3Q_bpmWF_mXEMSRlY7xsgsYXqsX5j3cBgbpiPWKKDH0W-5P0SFo5tS0x18ZHzRnKpHQ
4	5	9	Conjuring: Last Rites	The Warrens face their most personal case yet.	2025-09-05	Michael Chaves	Patrick Wilson, Vera Farmiga	Paranormal investigators confront a haunting tied to their own family.	movie	R	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/The%20Conjuring%20Last%20Rites%20Official%20Trailer%20-%20Warner%20Bros.%20India%20(144p).mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9UaGUgQ29uanVyaW5nIExhc3QgUml0ZXMgT2ZmaWNpYWwgVHJhaWxlciAtIFdhcm5lciBCcm9zLiBJbmRpYSAoMTQ0cCkubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTY5ODU4MSwiZXhwIjoxOTQ3Mzc4NTgxfQ.pedtxerCLCRHl_dQdjwysq-u-jSE0RBKUXjY0dCqGe8aeBh1b4MV3kiIoxJu-sTOst6P5-oL3eI1ho6ULCfiAw
6	2	4	Dune: Part Two	Paul Atreides unites with the Fremen to seek revenge.	2024-03-01	Denis Villeneuve	Timothee Chalamet, Zendaya	Paul continues his path to becoming Muad'Dib on Arrakis.	movie	PG-13	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Dune%20Part%20Two%20Official%20Trailer%20-%20Warner%20Bros.%20(144p).mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9EdW5lIFBhcnQgVHdvIE9mZmljaWFsIFRyYWlsZXIgLSBXYXJuZXIgQnJvcy4gKDE0NHApLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODk3MDcwMzEsImV4cCI6MTk0NzM4NzAzMX0.CtVcG8t3ApRQk8orvF0cIJj0lNR00UQ3JlOlO-goShPwAsPzyv5kfRqk-AAC8a2EV_h4w3liGs8Uy23rDGwDaQ
8	7	8	House of the Dragon	The Targaryen civil war two centuries before Thrones.	2022-08-21	Ryan Condal	Matt Smith, Emma D'Arcy	The Targaryen dynasty fractures into civil war.	series	TV-MA	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/House%20of%20the%20Dragons.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9Ib3VzZSBvZiB0aGUgRHJhZ29ucy5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NzA3MzM1LCJleHAiOjE5NDczODczMzV9.cEzBNjmwaSKt_mjz6PKzeqFZ3m1lUP0qgUjH3XyAVHZYhWrCpO3ftlKuP0wkhGNU0hhEevxQFDb0sChBxv9WVA
9	5	9	Insidious: The Red Door	The Lambert family confronts a supernatural realm.	2023-07-07	Patrick Wilson	Patrick Wilson, Ty Simpkins	Josh and Dalton must close the door they opened years ago.	movie	PG-13	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Insidious%20Out%20of%20the%20Further.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9JbnNpZGlvdXMgT3V0IG9mIHRoZSBGdXJ0aGVyLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODk3MDczOTgsImV4cCI6MTk0NzM4NzM5OH0.m3uZIuT1HIpoPkiH8_i781P1qfjwU0Cf-DdW-MFA1DhycvsQufg1FwasjfVAP8RTbFcuKpp6kHhjRA3XZgntZQ
12	4	2	Mean Girls	A new student navigates the social hierarchy of high school.	2004-04-30	Mark Waters	Lindsay Lohan, Rachel McAdams	Cady Heron infiltrates and topples the Plastics.	movie	PG-13	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Mean%20Girls.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9NZWFuIEdpcmxzLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODk3MDc0OTUsImV4cCI6MTk0NzM4NzQ5NX0.eA3RnNyXyr0nqI03kncOkdO48FVcQXz7PlJvr68Y4FJ2uoNEijB5kVkYV4asYJxdptZEpRAp8GU8JZXkD97SMQ
13	2	7	Mickey 17	An expendable astronaut is repeatedly cloned on a mission.	2025-03-07	Bong Joon-ho	Robert Pattinson, Naomi Ackie	A disposable clone questions his role in a colony mission.	movie	R	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/MIKEY%2017.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9NSUtFWSAxNy5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NzA3NTM0LCJleHAiOjE5NDczODc1MzR9.sp57BOFmScRpLlLP2Ecw5Q1Bs92V4EzT6AsUDVQ-V1GxE7JAWr-y4T6jf3AqQ6wbZeqm6uKSTPeH1oIrq3aIzA
15	8	5	Obsession	A psychological thriller about an affair spiraling out of control.	2023-04-13	Nakia Takrim	Richard Armitage, Charlie Murphy	An affair unravels a family's carefully built life.	series	TV-MA	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Obssession.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9PYnNzZXNzaW9uLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODk3MDc1OTksImV4cCI6MTk0NzM4NzU5OX0.6KU85sHNg0qRypwQUA881WFrjZQVGU-HdgbaOwdWHt4IeJCwCJ_E-_iCI9sedq-ty7XAltbAInLunHL5Md-p9g
16	6	1	Pride and Prejudice	Elizabeth Bennet navigates love and class in Regency England.	2005-09-16	Joe Wright	Keira Knightley, Matthew Macfadyen	A witty heroine clashes and falls for a proud gentleman.	movie	PG	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Pride%20&%20Prejudice.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9QcmlkZSAmIFByZWp1ZGljZS5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NzA4NDM2LCJleHAiOjE5NDczODg0MzZ9.WO5T_CaNvJrrcbZ5TVUUwM6MEY02liz6DyjcQHchkON4BpgKssO1SVbpOIgcC9CfQvDOJUOj61TV8FeM2FsuIQ
18	1	6	Spider-Man: Brand New Day	Peter Parker faces a new chapter as Spider-Man.	2026-07-24	Destin Daniel Cretton	Tom Holland, Zendaya	Spider-Man rebuilds his life after his identity is exposed.	movie	PG-13	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Spider-Man%20Brand%20New%20Day.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9TcGlkZXItTWFuIEJyYW5kIE5ldyBEYXkubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTcwODUxMCwiZXhwIjoxOTQ3Mzg4NTEwfQ.VAcl5sHvUnFK7n5P18F1xqrvY3MSzhy6AJtBfiZKiP0XfhrIU5TgPtXbs10pOsNRA6m1rx1PF3JUQkoX0lUfSQ
19	8	4	Stranger Things	Kids in a small town uncover supernatural government secrets.	2016-07-15	The Duffer Brothers	Millie Bobby Brown, Finn Wolfhard	Friends battle otherworldly forces from the Upside Down.	series	TV-14	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Stranger%20Things%20Official%20Final%20Trailer%20Netflix%20-%20Netflix%20(144p).mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9TdHJhbmdlciBUaGluZ3MgT2ZmaWNpYWwgRmluYWwgVHJhaWxlciBOZXRmbGl4IC0gTmV0ZmxpeCAoMTQ0cCkubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTcwODU0MiwiZXhwIjoxOTQ3Mzg4NTQyfQ.LDZNKh9M3ZhaRTNPjLcjqO4b9OMA39Si6oKAZWRK4I7QclQlkc4hbVMa7QyN4o99Apnr4ozXcIOSnUzF8rkWnQ
21	11	1	The Godfather	The aging patriarch of a crime dynasty transfers control.	1972-03-24	Francis Ford Coppola	Marlon Brando, Al Pacino	The Corleone family navigates power and betrayal.	movie	R	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/The%20Godfather%20Trailer%20(HD)%20-%20Fan-Made%20Film%20Trailers%20(144p).mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9UaGUgR29kZmF0aGVyIFRyYWlsZXIgKEhEKSAtIEZhbi1NYWRlIEZpbG0gVHJhaWxlcnMgKDE0NHApLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODk3MDkxODgsImV4cCI6MTk0NzM4OTE4OH0.vz8rCu8Af6lZy4CPudEnlxgspJkA8Q3O0mVFZIXnni0iHgAHQqlfTd8mNR0aL8PKdtohfd6MCsM690kkdAG_jA
23	12	6	The Odyssey	An epic retelling of Homer's legendary voyage.	2026-07-17	Christopher Nolan	Matt Damon, Tom Holland	Odysseus struggles to return home after the Trojan War.	movie	PG-13	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/The%20Odyssey.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9UaGUgT2R5c3NleS5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NzA5Mjc2LCJleHAiOjE5NDczODkyNzZ9.8r4uZQKgsmvuFWknewLTkvuh3Iv7nCBU0DEqFImfgaIeT0IFUpw5ktJ_mi7EyB1B7Os7jLTfV33es2vdZO-Shw
24	5	4	The Walking Dead	Survivors navigate a world overrun by the undead.	2010-10-31	Frank Darabont	Andrew Lincoln, Norman Reedus	A sheriff's deputy leads a group of survivors after a zombie outbreak.	series	TV-MA	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/The%20Walking%20Dead.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9UaGUgV2Fsa2luZyBEZWFkLm1wNCIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODk3MDkzMDYsImV4cCI6MTk0NzM4OTMwNn0.Q6rXcTqnL4frxyiaVJvXSHQJy4n9U6HEkmZ4I4wx8zGwKct4dlmgJquV5dvrQQ9tEYkFpOS2kDZmsSOw4gihzA
26	9	12	Toy Story 5	Woody, Buzz, and the gang face a brand-new challenge.	2026-06-19	Andrew Stanton	Tom Hanks, Tim Allen	The toys confront a new rival for Bonnie's affection.	movie	PG	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/Toy%20Story%205.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9Ub3kgU3RvcnkgNS5tcDQiLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5NzA5MzY4LCJleHAiOjE5NDczODkzNjh9.vmAR-DUMVeUxmpoKI8d7TVw54VhzgNWophmjxhVYlLNlgYrACz0yF2UVWn25ZAIATDCu1efT13ttYrwrN9u7yg
27	4	6	White Chicks	Two FBI agents go undercover as wealthy socialites.	2004-06-23	Keenen Ivory Wayans	Shawn Wayans, Marlon Wayans	Disgraced agents pose as heiresses to crack a kidnapping case.	movie	PG-13	2026-09-11 18:38:57.95735+00	\N	https://qlpyjglxifzwvcxrkaqo.supabase.co/storage/v1/object/sign/Trailers/White%20Chicks.mp4?token=eyJraWQiOiI1MDdkZDhkYS0wZGI3LTQwYzktOTY4YS03ZGM2Y2M3NDU3MjAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJUcmFpbGVycy9XaGl0ZSBDaGlja3MubXA0Iiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTcwOTM5NCwiZXhwIjoxOTQ3Mzg5Mzk0fQ.glC6vc1XUHsa6pYLNBKURP5qq2ZCr_6E92jKHKH-8zdB0avz59oiS3PCag0uju2wjzS6Qqcgq_7npEdtUWKxDA
\.


--
-- Data for Name: season; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."season" ("season_id", "content_id", "season_number", "season_title", "release_date") FROM stdin;
1	3	1	Bridgerton - Season 1	2020-12-25
2	3	2	Bridgerton - Season 2	2021-12-25
3	8	1	House of the Dragon - Season 1	2022-08-21
4	8	2	House of the Dragon - Season 2	2023-08-21
5	15	1	Obsession - Season 1	2023-04-13
6	15	2	Obsession - Season 2	2024-04-13
7	19	1	Stranger Things - Season 1	2016-07-15
8	19	2	Stranger Things - Season 2	2017-07-15
9	24	1	The Walking Dead - Season 1	2010-10-31
10	24	2	The Walking Dead - Season 2	2011-10-31
11	25	1	The Witcher - Season 1	2019-12-20
12	25	2	The Witcher - Season 2	2020-12-20
\.


--
-- Data for Name: episodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."episodes" ("episode_id", "season_id", "episode_number", "episode_title", "duration", "release_date") FROM stdin;
1	1	1	Episode 1	43	2020-12-26
2	1	2	Episode 2	44	2020-12-27
3	1	3	Episode 3	45	2020-12-28
4	2	1	Episode 1	43	2021-12-26
5	2	2	Episode 2	44	2021-12-27
6	2	3	Episode 3	45	2021-12-28
7	3	1	Episode 1	43	2022-08-22
8	3	2	Episode 2	44	2022-08-23
9	3	3	Episode 3	45	2022-08-24
10	4	1	Episode 1	43	2023-08-22
11	4	2	Episode 2	44	2023-08-23
12	4	3	Episode 3	45	2023-08-24
13	5	1	Episode 1	43	2023-04-14
14	5	2	Episode 2	44	2023-04-15
15	5	3	Episode 3	45	2023-04-16
16	6	1	Episode 1	43	2024-04-14
17	6	2	Episode 2	44	2024-04-15
18	6	3	Episode 3	45	2024-04-16
19	7	1	Episode 1	43	2016-07-16
20	7	2	Episode 2	44	2016-07-17
21	7	3	Episode 3	45	2016-07-18
22	8	1	Episode 1	43	2017-07-16
23	8	2	Episode 2	44	2017-07-17
24	8	3	Episode 3	45	2017-07-18
25	9	1	Episode 1	43	2010-11-01
26	9	2	Episode 2	44	2010-11-02
27	9	3	Episode 3	45	2010-11-03
28	10	1	Episode 1	43	2011-11-01
29	10	2	Episode 2	44	2011-11-02
30	10	3	Episode 3	45	2011-11-03
31	11	1	Episode 1	43	2019-12-21
32	11	2	Episode 2	44	2019-12-22
33	11	3	Episode 3	45	2019-12-23
34	12	1	Episode 1	43	2020-12-21
35	12	2	Episode 2	44	2020-12-22
36	12	3	Episode 3	45	2020-12-23
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."users" ("user_id", "full_name", "email", "password_hash", "phone_number", "date_of_birth", "account_status", "created_at", "updated_at", "deleted_at") FROM stdin;
2	Juan Dela Cruz	juan.dela.cruz@example.com	$2a$06$SR5CJpJnDbAKtuzlALnILebn3072hlD54Rz.5zTXdRy4gJ.FRuo2y	+63 917 111 0002	1995-06-21	active	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
3	Angela Reyes	angela.reyes@example.com	$2a$06$rxxupHrfbwuZiPmpb6hqzuYJOsYzJRkYALT.4Ar4BugY2IBjNSk22	+63 917 111 0003	2001-11-03	active	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
4	Mark Villanueva	mark.villanueva@example.com	$2a$06$UDATSOAHTGHeCvkeCpwy9.Gn2NdYuU69Ql9q5Q25IRGjFaBD.GVK6	+63 917 111 0004	1999-09-09	active	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
5	Kristine Bautista	kristine.bautista@example.com	$2a$06$ui707ecpPw0ZlETV6jLq0OBtmJEZytLhrbnHHNGUZYlucigaKUQ46	+63 917 111 0005	1993-01-27	suspended	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
6	Paolo Ramos	paolo.ramos@example.com	$2a$06$W5PHyI1e7IHqPwkm5v1eyOgxpGKes1qI0NmTUvs.wgY4OClFTEe6e	+63 917 111 0006	1990-04-18	active	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
7	Isabel Torres	isabel.torres@example.com	$2a$06$z7PlOOVKgz8..dLxgaDF0.yfYoCTjY7/BeX9yA5CFuot5iaPtp0fW	+63 917 111 0007	2000-07-30	active	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
8	Carlo Mendoza	carlo.mendoza@example.com	$2a$06$eWviLrmu1WX9FZAiJdQH.uphwFbZM9zZHe5DXgP2cyrlNwt1ovYuG	+63 917 111 0008	1997-12-05	deactivated	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
9	Nicole Fernandez	nicole.fernandez@example.com	$2a$06$rbR5jYxmgcYq3SNnz9Mxj.y.s/KbF5ko1clgcItk8JNA1SCM791jS	+63 917 111 0009	2002-03-22	active	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
10	Rafael Aquino	rafael.aquino@example.com	$2a$06$4BPXJbXglUAg58hQnP.RZOUqBRxMEzjwulCBQQsFRoIqzijB4UFYC	+63 917 111 0010	1996-08-14	active	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
11	Samantha Cruz	samantha.cruz@example.com	$2a$06$zNai3hNMbBbYXbq9ZRulCO1AxEPMJg5dAxcsACqRqDmPyGKoDAchq	+63 917 111 0011	1994-05-02	active	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
12	Miguel Garcia	miguel.garcia@example.com	$2a$06$hP8ydMUjIKK4r4AUdLH4EuWeTU6IR3Vh.fPJ9tOYqaZm.WUJtfv2.	+63 917 111 0012	1992-10-19	active	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
13	Dana Lopez	dana.lopez@example.com	$2a$06$HYdQyOINpfGab3HrVGmsCel4mP5sAZzZpOMkmyou27ZeiDG2bZFFm	+63 917 111 0013	2003-01-11	active	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
14	Enzo Navarro	enzo.navarro@example.com	$2a$06$GkRjtIK/aQTh7KSoDJU03.UgrPwYzMT63vmD09sxi18E/MpTEfiH6	+63 917 111 0014	1998-06-06	active	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
15	Hannah Castillo	hannah.castillo@example.com	$2a$06$sBco5eEh5btj9MGS4kaQpOWCJhA1aN5O9/ugGGUWiHjt1Jp4.cYJm	+63 917 111 0015	1991-09-25	active	2026-09-11 18:41:44.895358+00	2026-09-11 18:47:08.981002+00	\N
16	User	testuser1@gmail.com	\N	\N	\N	active	2026-09-13 10:30:40+00	2026-09-13 10:30:56.521436+00	\N
1	Maria Santos	newemail@example.com	$2a$06$v457WjJ7WsNUUDyDYgAUzOSUz65tCsnTYTTydpZe.t96pOZLyqzLa	09171234567	1998-02-14	active	2026-09-11 18:41:44.895358+00	2026-09-17 15:01:02.411422+00	\N
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."favorites" ("fav_id", "user_id", "content_id", "date_added") FROM stdin;
1	1	4	2026-09-11 18:44:14.978601+00
2	2	5	2026-09-11 18:44:14.978601+00
3	3	6	2026-09-11 18:44:14.978601+00
4	4	7	2026-09-11 18:44:14.978601+00
5	5	8	2026-09-11 18:44:14.978601+00
6	6	9	2026-09-11 18:44:14.978601+00
8	8	11	2026-09-11 18:44:14.978601+00
9	9	12	2026-09-11 18:44:14.978601+00
10	10	13	2026-09-11 18:44:14.978601+00
11	11	14	2026-09-11 18:44:14.978601+00
12	12	15	2026-09-11 18:44:14.978601+00
27	16	13	2026-09-14 10:09:20.574423+00
28	16	3	2026-09-14 10:19:32.042434+00
29	1	1	2026-09-15 17:43:09.584623+00
31	2	1	2026-09-15 17:43:19.823987+00
\.


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."feedback" ("feedback_id", "user_id", "subject", "message", "created_date") FROM stdin;
1	1	App feedback #1	The streaming quality has been great on my end, thanks team!	2026-09-11 18:44:47.882718+00
2	2	App feedback #2	The streaming quality has been great on my end, thanks team!	2026-09-11 18:44:47.882718+00
3	3	App feedback #3	The streaming quality has been great on my end, thanks team!	2026-09-11 18:44:47.882718+00
4	4	App feedback #4	The streaming quality has been great on my end, thanks team!	2026-09-11 18:44:47.882718+00
5	5	App feedback #5	The streaming quality has been great on my end, thanks team!	2026-09-11 18:44:47.882718+00
6	6	App feedback #6	The streaming quality has been great on my end, thanks team!	2026-09-11 18:44:47.882718+00
7	7	App feedback #7	The streaming quality has been great on my end, thanks team!	2026-09-11 18:44:47.882718+00
8	8	App feedback #8	The streaming quality has been great on my end, thanks team!	2026-09-11 18:44:47.882718+00
9	9	App feedback #9	The streaming quality has been great on my end, thanks team!	2026-09-11 18:44:47.882718+00
10	10	App feedback #10	The streaming quality has been great on my end, thanks team!	2026-09-11 18:44:47.882718+00
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."plans" ("plan_id", "plan_name", "max_members", "monthly_price", "is_active") FROM stdin;
1	Mobile	1	129.00	t
2	Basic	1	199.00	t
3	Standard	2	349.00	t
4	Premium	4	549.00	t
5	Student	1	149.00	t
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."subscriptions" ("subscription_id", "subscription_user_id", "plan_id", "start_date", "end_date", "status", "created_at") FROM stdin;
1	1	2	2026-08-13	\N	active	2026-09-11 18:42:41.58355+00
2	2	3	2026-07-14	\N	active	2026-09-11 18:42:41.58355+00
3	3	4	2026-06-14	\N	active	2026-09-11 18:42:41.58355+00
4	4	5	2026-05-15	\N	active	2026-09-11 18:42:41.58355+00
5	5	1	2026-04-15	\N	cancelled	2026-09-11 18:42:41.58355+00
6	6	2	2026-03-16	\N	active	2026-09-11 18:42:41.58355+00
7	7	3	2026-02-14	\N	active	2026-09-11 18:42:41.58355+00
8	8	4	2026-01-15	\N	cancelled	2026-09-11 18:42:41.58355+00
9	9	5	2025-12-16	\N	active	2026-09-11 18:42:41.58355+00
10	10	1	2025-11-16	\N	active	2026-09-11 18:42:41.58355+00
11	11	2	2025-10-17	\N	active	2026-09-11 18:42:41.58355+00
12	12	3	2025-09-17	\N	active	2026-09-11 18:42:41.58355+00
13	13	4	2025-08-18	\N	active	2026-09-11 18:42:41.58355+00
14	14	5	2025-07-19	\N	active	2026-09-11 18:42:41.58355+00
15	15	1	2025-06-19	\N	active	2026-09-11 18:42:41.58355+00
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."members" ("member_id", "subscription_id", "user_id", "relationship", "date_added") FROM stdin;
1	2	2	Household member	2026-09-11 18:43:17.889313+00
2	3	3	Household member	2026-09-11 18:43:17.889313+00
3	7	7	Household member	2026-09-11 18:43:17.889313+00
4	8	8	Household member	2026-09-11 18:43:17.889313+00
5	12	12	Household member	2026-09-11 18:43:17.889313+00
6	13	13	Household member	2026-09-11 18:43:17.889313+00
\.


--
-- Data for Name: merchandise_product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."merchandise_product" ("product_id", "product_name", "category", "price", "listing_status") FROM stdin;
1	StreamFlix Logo Hoodie	Apparel	1299.00	active
2	The Witcher Medallion Replica	Collectible	899.00	active
3	Stranger Things Mug	Homeware	399.00	active
4	John Wick Pin Set	Accessory	249.00	active
5	House of the Dragon Poster	Print	199.00	active
6	StreamFlix Tote Bag	Accessory	349.00	sold_out
7	Dune Sandworm Figure	Collectible	1599.00	active
8	Toy Story Plush Set	Toy	799.00	active
9	The Godfather Blu-ray	Media	999.00	active
10	StreamFlix Cap	Apparel	349.00	removed
\.


--
-- Data for Name: merchandise_transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."merchandise_transaction" ("transaction_id", "user_id", "product_id", "quantity", "total_amount", "created_at") FROM stdin;
1	1	2	2	1798.00	2026-09-11 18:45:32.51121+00
2	2	3	3	1197.00	2026-09-11 18:45:32.51121+00
3	3	4	1	249.00	2026-09-11 18:45:32.51121+00
4	4	5	2	398.00	2026-09-11 18:45:32.51121+00
5	5	6	3	1047.00	2026-09-11 18:45:32.51121+00
6	6	7	1	1599.00	2026-09-11 18:45:32.51121+00
7	7	8	2	1598.00	2026-09-11 18:45:32.51121+00
8	8	9	3	2997.00	2026-09-11 18:45:32.51121+00
9	9	10	1	349.00	2026-09-11 18:45:32.51121+00
10	10	1	2	2598.00	2026-09-11 18:45:32.51121+00
11	11	2	3	2697.00	2026-09-11 18:45:32.51121+00
12	12	3	1	399.00	2026-09-11 18:45:32.51121+00
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."profiles" ("profile_id", "user_id", "profile_name", "avatar_url", "device", "created_at") FROM stdin;
2	2	Juan	/avatars/avatar-2.png	Web Browser	2026-09-11 18:42:15.112361+00
3	3	Angela	/avatars/avatar-3.png	Web Browser	2026-09-11 18:42:15.112361+00
4	4	Mark	/avatars/avatar-4.png	Web Browser	2026-09-11 18:42:15.112361+00
5	5	Kristine	/avatars/avatar-5.png	Web Browser	2026-09-11 18:42:15.112361+00
6	6	Paolo	/avatars/avatar-6.png	Web Browser	2026-09-11 18:42:15.112361+00
7	7	Isabel	/avatars/avatar-7.png	Web Browser	2026-09-11 18:42:15.112361+00
8	8	Carlo	/avatars/avatar-8.png	Web Browser	2026-09-11 18:42:15.112361+00
9	9	Nicole	/avatars/avatar-9.png	Web Browser	2026-09-11 18:42:15.112361+00
10	10	Rafael	/avatars/avatar-10.png	Web Browser	2026-09-11 18:42:15.112361+00
11	11	Samantha	/avatars/avatar-11.png	Web Browser	2026-09-11 18:42:15.112361+00
12	12	Miguel	/avatars/avatar-12.png	Web Browser	2026-09-11 18:42:15.112361+00
13	13	Dana	/avatars/avatar-13.png	Web Browser	2026-09-11 18:42:15.112361+00
14	14	Enzo	/avatars/avatar-14.png	Web Browser	2026-09-11 18:42:15.112361+00
15	15	Hannah	/avatars/avatar-15.png	Web Browser	2026-09-11 18:42:15.112361+00
1	1	Boots	https://boots.com/avatar.png	Web Browser	2026-09-11 18:42:15.112361+00
\.


--
-- Data for Name: review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."review" ("review_id", "user_id", "content_id", "rating_value", "review_comment", "review_date") FROM stdin;
2	2	4	3.4	Great watch, would recommend!	2026-09-11 18:43:52.857611+00
3	3	5	4.2	Great watch, would recommend!	2026-09-11 18:43:52.857611+00
4	4	6	4.6	Great watch, would recommend!	2026-09-11 18:43:52.857611+00
5	5	7	3.0	Great watch, would recommend!	2026-09-11 18:43:52.857611+00
6	6	8	4.6	Great watch, would recommend!	2026-09-11 18:43:52.857611+00
7	7	9	4.4	Great watch, would recommend!	2026-09-11 18:43:52.857611+00
9	9	11	3.3	Great watch, would recommend!	2026-09-11 18:43:52.857611+00
10	10	12	4.9	Great watch, would recommend!	2026-09-11 18:43:52.857611+00
11	11	13	3.7	Great watch, would recommend!	2026-09-11 18:43:52.857611+00
12	12	14	3.2	Great watch, would recommend!	2026-09-11 18:43:52.857611+00
1	1	3	4.1	Updated review comment for trigger testing.	2026-09-15 17:20:02.939419+00
\.


--
-- Data for Name: view_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."view_history" ("history_id", "user_id", "content_id", "episode_id", "watch_date", "progress_percentage") FROM stdin;
1	1	2	\N	2026-09-11 18:43:32.725829+00	64.30
2	2	3	\N	2026-09-11 18:43:32.725829+00	3.48
3	3	4	\N	2026-09-11 18:43:32.725829+00	28.23
4	4	5	\N	2026-09-11 18:43:32.725829+00	23.10
5	5	6	\N	2026-09-11 18:43:32.725829+00	73.91
6	6	7	\N	2026-09-11 18:43:32.725829+00	67.99
7	7	8	\N	2026-09-11 18:43:32.725829+00	89.33
8	8	9	\N	2026-09-11 18:43:32.725829+00	9.61
10	10	11	\N	2026-09-11 18:43:32.725829+00	3.95
11	11	12	\N	2026-09-11 18:43:32.725829+00	22.65
12	12	13	\N	2026-09-11 18:43:32.725829+00	51.03
13	13	14	\N	2026-09-11 18:43:32.725829+00	3.63
14	14	15	\N	2026-09-11 18:43:32.725829+00	20.68
15	15	16	\N	2026-09-11 18:43:32.725829+00	65.34
\.


--
-- Data for Name: watch_list; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."watch_list" ("list_id", "user_id", "content_id", "episode_id", "progress", "date_added", "watchlist_status") FROM stdin;
1	1	5	\N	9.67	2026-09-11 18:44:30.049436+00	in_progress
2	2	6	\N	60.37	2026-09-11 18:44:30.049436+00	planned
3	3	7	\N	72.97	2026-09-11 18:44:30.049436+00	completed
4	4	8	\N	12.48	2026-09-11 18:44:30.049436+00	in_progress
5	5	9	\N	7.88	2026-09-11 18:44:30.049436+00	in_progress
7	7	11	\N	88.55	2026-09-11 18:44:30.049436+00	in_progress
8	8	12	\N	57.74	2026-09-11 18:44:30.049436+00	completed
9	9	13	\N	6.96	2026-09-11 18:44:30.049436+00	completed
10	10	14	\N	22.79	2026-09-11 18:44:30.049436+00	in_progress
11	11	15	\N	98.52	2026-09-11 18:44:30.049436+00	planned
12	12	16	\N	86.65	2026-09-11 18:44:30.049436+00	in_progress
16	16	13	\N	0.00	2026-09-14 10:09:22.902403+00	planned
17	16	3	\N	0.00	2026-09-14 10:19:31.35551+00	planned
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type", "versioning_status") FROM stdin;
test	test	\N	2026-09-16 05:54:50.118517+00	2026-09-16 05:54:50.118517+00	f	f	\N	\N	\N	STANDARD	DISABLED
Trailers	Trailers	\N	2026-09-16 12:01:08.046236+00	2026-09-16 12:01:08.046236+00	f	f	\N	\N	\N	STANDARD	DISABLED
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_analytics" ("name", "type", "format", "created_at", "updated_at", "id", "deleted_at") FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_vectors" ("id", "type", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "archived_at", "is_delete_marker", "is_versioned") FROM stdin;
a2c45dc7-3374-4630-82f6-4e7a510a4f01	Trailers	The Notebook.mp4	\N	2026-09-17 13:21:16.432242+00	2026-09-17 13:21:16.432242+00	2026-09-17 13:21:16.432242+00	{"eTag": "\\"d65d709b0978da531fabeb7d21654bcb-1\\"", "size": 5118692, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:21:16.000Z", "contentLength": 5118692, "httpStatusCode": 200}	9648704a-9310-44f5-8982-d0090531eeeb	\N	\N	\N	f	f
703ef00d-dde4-44f4-8788-4d7b47724e36	Trailers	Mean Girls.mp4	\N	2026-09-17 13:26:10.468452+00	2026-09-17 13:26:10.468452+00	2026-09-17 13:26:10.468452+00	{"eTag": "\\"26f96de175150894a79b9a299f2b5833-2\\"", "size": 7411367, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:26:09.000Z", "contentLength": 7411367, "httpStatusCode": 200}	ea225fc4-939c-454b-bb82-4f5a07d121fd	\N	\N	\N	f	f
80835a3d-a018-4396-89f3-fabdd2cfadd5	Trailers	Obssession.mp4	\N	2026-09-17 13:32:09.236663+00	2026-09-17 13:32:09.236663+00	2026-09-17 13:32:09.236663+00	{"eTag": "\\"96dd7d8d33e54e9062324b3b0f3c3e40-1\\"", "size": 5154627, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:32:09.000Z", "contentLength": 5154627, "httpStatusCode": 200}	159ab72b-8e84-46e9-a073-d48962d9d7e3	\N	\N	\N	f	f
3dadba38-12a4-43b8-8d3f-0afa10cea5fc	Trailers	Project Hail Mary.mp4	\N	2026-09-17 13:35:57.899144+00	2026-09-17 13:35:57.899144+00	2026-09-17 13:35:57.899144+00	{"eTag": "\\"1b0c56affefe466d734b201d9950fae2-2\\"", "size": 7114400, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:35:57.000Z", "contentLength": 7114400, "httpStatusCode": 200}	62e128cf-4e10-40e0-8cd8-8d3ce670b993	\N	\N	\N	f	f
e518fdaa-cf6e-4fb1-9508-ddc3ead9db2d	Trailers	.emptyFolderPlaceholder	\N	2026-09-16 15:44:20.327707+00	2026-09-16 15:44:20.327707+00	2026-09-16 15:44:20.327707+00	{"eTag": "\\"d41d8cd98f00b204e9800998ecf8427e\\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-09-16T15:44:20.332Z", "contentLength": 0, "httpStatusCode": 200}	1402e439-1f8b-4e6e-b8d2-5081b63e261c	\N	{}	\N	f	f
75f39632-f0dc-4ef3-8611-38535c75d359	Trailers	The Godfather Trailer (HD) - Fan-Made Film Trailers (144p).mp4	\N	2026-09-17 12:45:55.797005+00	2026-09-17 12:45:55.797005+00	2026-09-17 12:45:55.797005+00	{"eTag": "\\"e001db3d7198ee37c67b2a337c1a7f14-1\\"", "size": 2303545, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T12:45:56.000Z", "contentLength": 2303545, "httpStatusCode": 200}	5ed7a653-f499-4823-9c1b-b1b4a6dfbcee	\N	\N	\N	f	f
618c4b41-53d4-4491-ab3d-b0112c8cbdaa	Trailers	Stranger Things Official Final Trailer Netflix - Netflix (144p).mp4	\N	2026-09-17 12:49:54.532973+00	2026-09-17 12:49:54.532973+00	2026-09-17 12:49:54.532973+00	{"eTag": "\\"4977905c493296d4bd9465bbf0e34f2a-1\\"", "size": 3216419, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T12:49:54.000Z", "contentLength": 3216419, "httpStatusCode": 200}	294bfd46-2e02-4f20-b92a-b971de0f1e1e	\N	\N	\N	f	f
bfb43b09-79e2-408f-8ee7-7ce402ff4fe8	Trailers	The Witcher.mp4	\N	2026-09-17 12:52:48.024072+00	2026-09-17 12:52:48.024072+00	2026-09-17 12:52:48.024072+00	{"eTag": "\\"6c1c1ce317ea4cc74b4294496fc827f9-1\\"", "size": 3920169, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T12:52:48.000Z", "contentLength": 3920169, "httpStatusCode": 200}	02aed7cf-7faa-4163-b606-3c67fd591fe7	\N	\N	\N	f	f
ba48cd01-7549-4a5f-947a-b80c39eb82db	Trailers	Avengers Endgame.mp4	\N	2026-09-17 12:58:52.840748+00	2026-09-17 12:58:52.840748+00	2026-09-17 12:58:52.840748+00	{"eTag": "\\"19fcdc6ca4ea725660a3d1074414d803-1\\"", "size": 5452202, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T12:58:53.000Z", "contentLength": 5452202, "httpStatusCode": 200}	f07e17c8-bdee-4c7c-a8bd-9af8e8727bde	\N	\N	\N	f	f
93ee864d-9be3-46d2-b8a3-e5c2f246e3df	Trailers	Spider-Man Brand New Day.mp4	\N	2026-09-17 13:02:54.105348+00	2026-09-17 13:02:54.105348+00	2026-09-17 13:02:54.105348+00	{"eTag": "\\"4d36216450c97656811dad9540959d8c-2\\"", "size": 10103484, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:02:53.000Z", "contentLength": 10103484, "httpStatusCode": 200}	67139aaa-9623-4e5e-9a73-d975a47552d1	\N	\N	\N	f	f
e79d88f9-8c33-4375-ab9a-e3ce27595903	Trailers	Pride & Prejudice.mp4	\N	2026-09-17 13:05:40.100303+00	2026-09-17 13:05:40.100303+00	2026-09-17 13:05:40.100303+00	{"eTag": "\\"9ff2179c793c2cc4d78cd3179eab6f1c-2\\"", "size": 6433966, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:05:39.000Z", "contentLength": 6433966, "httpStatusCode": 200}	3bf9c319-9ed0-436e-bcd7-60627ef74dd3	\N	\N	\N	f	f
ba039fa9-d1db-4279-9b8c-0e92815a10e3	Trailers	White Chicks.mp4	\N	2026-09-17 13:08:22.790233+00	2026-09-17 13:08:22.790233+00	2026-09-17 13:08:22.790233+00	{"eTag": "\\"5005f75e065e7048a9095603098b54d7-2\\"", "size": 10643813, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:08:22.000Z", "contentLength": 10643813, "httpStatusCode": 200}	3add66e8-bdc1-44c1-a011-41689794accb	\N	\N	\N	f	f
567df885-c2cd-42e7-92d5-bfdc00791da7	Trailers	The Walking Dead.mp4	\N	2026-09-17 13:10:35.636068+00	2026-09-17 13:10:35.636068+00	2026-09-17 13:10:35.636068+00	{"eTag": "\\"d393acbdfcd1765d88d2013c3a213e0b-1\\"", "size": 4340723, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:10:36.000Z", "contentLength": 4340723, "httpStatusCode": 200}	7a39a821-542d-49d7-959c-7d1ad0b07a60	\N	\N	\N	f	f
57cc349e-97da-4333-8796-44c3c18324d8	Trailers	House of the Dragons.mp4	\N	2026-09-17 13:12:54.857242+00	2026-09-17 13:12:54.857242+00	2026-09-17 13:12:54.857242+00	{"eTag": "\\"fcd85c056c16b27a2b21ac7c9bd3305e-1\\"", "size": 4942119, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:12:55.000Z", "contentLength": 4942119, "httpStatusCode": 200}	492124d7-6551-494b-8380-e241a1a7143b	\N	\N	\N	f	f
68692e5f-cf0a-483d-9f85-4b99458b50ad	Trailers	John Wick Chapter 4.mp4	\N	2026-09-17 13:19:18.752244+00	2026-09-17 13:19:18.752244+00	2026-09-17 13:19:18.752244+00	{"eTag": "\\"3f72302d52666a06ff9d1b87223d1215-1\\"", "size": 4922297, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:19:19.000Z", "contentLength": 4922297, "httpStatusCode": 200}	b9b672bb-4500-407e-a55c-826e2ba9d6a3	\N	\N	\N	f	f
7b5aab67-78ff-4068-9278-c226f8cc1a40	Trailers	The Dark Knight Rises Ultimate Trilogy Trailer - Christopher Nolan Batman Movie Legacy HD - Rotten Tomatoes Trailers (144p).mp4	\N	2026-09-16 15:44:57.768999+00	2026-09-16 15:44:57.768999+00	2026-09-16 15:44:57.768999+00	{"eTag": "\\"f73180e24e03abb5285551fcab9ba40b-2\\"", "size": 8657626, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-16T15:44:57.000Z", "contentLength": 8657626, "httpStatusCode": 200}	873c3b29-1100-47a8-82bd-b1197e0f7ee9	\N	\N	\N	f	f
13890439-4404-403c-bb25-e920e471f0dc	Trailers	Dune Part Two Official Trailer - Warner Bros. (144p).mp4	\N	2026-09-16 15:47:06.5481+00	2026-09-16 15:47:06.5481+00	2026-09-16 15:47:06.5481+00	{"eTag": "\\"381bf2815506b687824d669757946c92-1\\"", "size": 3660073, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-16T15:47:06.000Z", "contentLength": 3660073, "httpStatusCode": 200}	bff5c636-1d3d-4c92-9fa3-daa436214ec5	\N	\N	\N	f	f
a31e2b4a-118f-4295-bca1-c8df9ff7a338	Trailers	Minions and Monsters.mp4	\N	2026-09-17 13:39:49.691739+00	2026-09-17 13:39:49.691739+00	2026-09-17 13:39:49.691739+00	{"eTag": "\\"0cdc00e6334f16d41a5efb6a8eec11ef-2\\"", "size": 9152838, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:39:48.000Z", "contentLength": 9152838, "httpStatusCode": 200}	79af6829-88a0-4aa7-96dc-feeb1b3bf4d0	\N	\N	\N	f	f
74a20876-dd6d-40f7-8506-bcc03914fcaa	Trailers	Bridgerton Official Trailer Netflix - Netflix (144p).mp4	\N	2026-09-17 01:03:04.081053+00	2026-09-17 01:03:04.081053+00	2026-09-17 01:03:04.081053+00	{"eTag": "\\"2997955aa64d19b76f3bd039bfd7a787-1\\"", "size": 4419800, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T01:03:04.000Z", "contentLength": 4419800, "httpStatusCode": 200}	75979a18-3545-4e67-88f7-cffb6d64d848	\N	\N	\N	f	f
4071cf0e-9f07-4a12-b9c3-f3d87d3868ec	Trailers	The Conjuring Last Rites Official Trailer - Warner Bros. India (144p).mp4	\N	2026-09-17 01:05:45.900284+00	2026-09-17 01:05:45.900284+00	2026-09-17 01:05:45.900284+00	{"eTag": "\\"2db520605a414a72eb121703e6337e57-1\\"", "size": 3688963, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T01:05:46.000Z", "contentLength": 3688963, "httpStatusCode": 200}	ef326448-4155-4542-a6b4-d36eb93c092b	\N	\N	\N	f	f
82d381a8-9179-4d45-a677-ea755e7adf6e	Trailers	Deadpool.mp4	\N	2026-09-17 01:14:17.787103+00	2026-09-17 01:14:17.787103+00	2026-09-17 01:14:17.787103+00	{"eTag": "\\"f81c7d83fa0919d3d2f650c795cdcc16-2\\"", "size": 9794437, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T01:14:17.000Z", "contentLength": 9794437, "httpStatusCode": 200}	64023978-1f77-47f6-9583-2bf0954bda9c	\N	\N	\N	f	f
7270f7ab-f41a-4c77-99ab-e5dc127da466	Trailers	Friday.mp4	\N	2026-09-17 01:16:43.315775+00	2026-09-17 01:16:43.315775+00	2026-09-17 01:16:43.315775+00	{"eTag": "\\"5c25e03a7cd51fe7fd34fd6177b32931-2\\"", "size": 6306868, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T01:16:41.000Z", "contentLength": 6306868, "httpStatusCode": 200}	a8a7053a-88d3-4ae6-9351-49bb8f8f40a8	\N	\N	\N	f	f
eea44c0d-f6c7-4c59-91d4-258b62b13a3b	Trailers	Toy Story 5.mp4	\N	2026-09-17 13:48:29.500028+00	2026-09-17 13:48:29.500028+00	2026-09-17 13:48:29.500028+00	{"eTag": "\\"31427f6042acfea8664a37e6891bd579-2\\"", "size": 8960437, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:48:28.000Z", "contentLength": 8960437, "httpStatusCode": 200}	7d959f19-d541-42ef-8fbf-d55757556d7d	\N	\N	\N	f	f
46fd0bb8-123c-46b0-b13c-3861e9c679f2	Trailers	MIKEY 17.mp4	\N	2026-09-17 12:40:48.862963+00	2026-09-17 12:40:48.862963+00	2026-09-17 12:40:48.862963+00	{"eTag": "\\"0c651b2189bb8a7391351c1b67493f7f-2\\"", "size": 7422837, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T12:40:48.000Z", "contentLength": 7422837, "httpStatusCode": 200}	380afaa8-3dda-491f-9ebd-69c8bebc372d	\N	\N	\N	f	f
1d1fdbf2-2e66-4b18-af68-b96d793d0d3e	Trailers	The Odyssey.mp4	\N	2026-09-17 13:51:17.017283+00	2026-09-17 13:51:17.017283+00	2026-09-17 13:51:17.017283+00	{"eTag": "\\"ad7eb13179e271f72d6bc6d2d58ba75b-1\\"", "size": 5761644, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:51:17.000Z", "contentLength": 5761644, "httpStatusCode": 200}	499d55a4-458d-4b5b-a7fa-32ab542ead41	\N	\N	\N	f	f
9fe4b5ea-82f1-4df6-8210-a0440d002503	Trailers	The Fall Guy Official Trailer - Universal Pictures (144p).mp4	\N	2026-09-17 12:43:22.033375+00	2026-09-17 12:43:22.033375+00	2026-09-17 12:43:22.033375+00	{"eTag": "\\"ec6bb54268396fe4607282e4ae76148b-1\\"", "size": 5533665, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T12:43:22.000Z", "contentLength": 5533665, "httpStatusCode": 200}	da219d38-7da3-4fd2-bb0b-7eefb14b975d	\N	\N	\N	f	f
44dbea52-dd14-4799-b8ff-f87c889fceb0	Trailers	Insidious Out of the Further.mp4	\N	2026-09-17 13:56:06.849488+00	2026-09-17 13:56:06.849488+00	2026-09-17 13:56:06.849488+00	{"eTag": "\\"8ca0b4e2e678811c3e9e2c7b059fcafe-2\\"", "size": 7283976, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-17T13:56:06.000Z", "contentLength": 7283976, "httpStatusCode": 200}	98f3ef88-f7f2-4bcd-a89d-4588531579c2	\N	\N	\N	f	f
20339d51-1523-4487-b7e8-d51a7c231fee	Trailers	Simple CRUD Application - For Test Only - rikoari (144p).mp4	\N	2026-09-18 05:43:07.064043+00	2026-09-18 05:43:07.064043+00	2026-09-18 05:43:07.064043+00	{"eTag": "\\"8ae111e0dc53efc499fefa1295a56298-1\\"", "size": 810523, "mimetype": "video/mp4", "cacheControl": "max-age=3600", "lastModified": "2026-09-18T05:43:07.000Z", "contentLength": 810523, "httpStatusCode": 200}	13af9ad7-e314-4494-9abc-5c67e2455355	\N	\N	\N	f	f
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads" ("id", "in_progress_size", "upload_signature", "bucket_id", "key", "version", "owner_id", "created_at", "user_metadata", "metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads_parts" ("id", "upload_id", "size", "part_number", "bucket_id", "key", "etag", "owner_id", "version", "created_at") FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."vector_indexes" ("id", "name", "bucket_id", "data_type", "dimension", "distance_metric", "metadata_configuration", "created_at", "updated_at") FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 14, true);


--
-- Name: content_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."content_content_id_seq"', 33, true);


--
-- Name: content_license_license_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."content_license_license_id_seq"', 12, true);


--
-- Name: episodes_episode_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."episodes_episode_id_seq"', 36, true);


--
-- Name: favorites_fav_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."favorites_fav_id_seq"', 31, true);


--
-- Name: feedback_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."feedback_feedback_id_seq"', 10, true);


--
-- Name: genre_genre_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."genre_genre_id_seq"', 13, true);


--
-- Name: members_member_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."members_member_id_seq"', 6, true);


--
-- Name: merchandise_product_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."merchandise_product_product_id_seq"', 10, true);


--
-- Name: merchandise_transaction_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."merchandise_transaction_transaction_id_seq"', 12, true);


--
-- Name: plans_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."plans_plan_id_seq"', 5, true);


--
-- Name: profiles_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."profiles_profile_id_seq"', 15, true);


--
-- Name: review_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."review_review_id_seq"', 12, true);


--
-- Name: season_season_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."season_season_id_seq"', 12, true);


--
-- Name: subscriptions_subscription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."subscriptions_subscription_id_seq"', 15, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."users_user_id_seq"', 15, true);


--
-- Name: view_history_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."view_history_history_id_seq"', 15, true);


--
-- Name: watch_list_list_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."watch_list_list_id_seq"', 17, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict yYbJvk1GQuxuMeDs3Xck7L4hHWz9UeIRgaoIM1OoZhbQas2O2Jxjp1YNo5FlpWc

RESET ALL;
