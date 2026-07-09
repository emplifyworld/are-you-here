-- Reopen migration: revert the 0002_lockdown owner-scoped RLS policies back
-- to permissive v1 policies. The app has gone back to demo-first mode (pick
-- a name, no login) so real signups are on hold — the login/auth code paths
-- are left in the codebase but unused, and the database must match that:
-- auth.uid()-scoped policies would reject every write from the anonymous
-- demo flow.

-- USERS ----------------------------------------------------------------
drop policy if exists "users_owner_insert" on users;
drop policy if exists "users_owner_update" on users;

create policy "users_v1_write" on users for all using (true) with check (true);

-- VISITS -----------------------------------------------------------------
drop policy if exists "visits_owner_insert" on visits;
drop policy if exists "visits_owner_update" on visits;
drop policy if exists "visits_owner_delete" on visits;

create policy "visits_v1_write" on visits for all using (true) with check (true);

-- CONNECTION_REQUESTS -----------------------------------------------------
drop policy if exists "connection_requests_owner_read" on connection_requests;
drop policy if exists "connection_requests_sender_insert" on connection_requests;
drop policy if exists "connection_requests_recipient_update" on connection_requests;

create policy "connection_requests_v1_read" on connection_requests for select using (true);
create policy "connection_requests_v1_write" on connection_requests for all using (true) with check (true);

-- PAYMENTS -----------------------------------------------------------------
drop policy if exists "payments_owner_read" on payments;

create policy "payments_v1_read" on payments for select using (true);
create policy "payments_v1_write" on payments for all using (true) with check (true);

-- ACTIVITY_LOGS --------------------------------------------------------
drop policy if exists "activity_logs_owner_read" on activity_logs;
drop policy if exists "activity_logs_owner_insert" on activity_logs;

create policy "activity_logs_v1_read" on activity_logs for select using (true);
create policy "activity_logs_v1_write" on activity_logs for all using (true) with check (true);
