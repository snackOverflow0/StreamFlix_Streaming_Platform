# Kids profiles and mobile admin

Supabase was updated with profiles.is_kids and content.is_kids_suitable. Add-profile and edit-profile dialogs have an accessible Kids switch. Names no longer determine Kids mode; existing profiles named exactly Kids were migrated.

The database currently marks Toy Story 5 and Minions and Monsters as reviewed Kids titles (PG, Animation). PG titles require explicit approval; G/TV-Y/TV-Y7/TV-G and equivalent child ratings are allowed. Unknown, adult and teen ratings remain excluded even if marked approved. The admin content editor includes is_kids_suitable for catalog review. Review suitability before approving new titles; genre alone does not establish suitability.

The catalog, recommendations, search and personal shelves filter using the selected profile. Backend playback validates profile ownership and Kids eligibility. This is content filtering, not parental PIN protection; account owners can edit the setting or switch profiles.

Admin orange/amber accents changed to blue/cyan. Mobile toolbars wrap, actions remain visible, fields and dialogs fit the viewport, wide tables scroll within panels and controls have larger touch targets. Desktop management structure retained.

Builds and mocked Kids/admin authorization checks were run. Live database fields and approved rows were verified. Mobile visual acceptance, live create/edit/readback and playback with real accounts should be checked locally.

Extract into a fresh folder, copy your working .env files, run npm ci in each application and follow DEV_START_FIX.md. The database migration is included in database/explicit-kids-profiles.sql for other environments; it has already been applied to the connected project.
