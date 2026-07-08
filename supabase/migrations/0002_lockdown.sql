-- Lock-down migration: replace permissive v1 RLS with owner-scoped policies.
-- Public read access is preserved everywhere (discovery still works for
-- anonymous visitors); writes now require a real authenticated owner.
--
-- Seed/demo users have user_id = null and are therefore read-only after this
-- migration — nobody can act as them. Real actions require signing in via
-- /login, which creates your own users row linked to auth.uid().

-- USERS ----------------------------------------------------------------
drop policy if exists "users_v1_write" on users;

create policy "users_owner_insert" on users
  for insert with check (auth.uid() = user_id);

create policy "users_owner_update" on users
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- users_v1_read (select using (true)) is unchanged — profiles stay public.

-- VISITS -----------------------------------------------------------------
drop policy if exists "visits_v1_write" on visits;

create policy "visits_owner_insert" on visits
  for insert with check (
    exists (select 1 from users u where u.id = visits.user_id and u.user_id = auth.uid())
  );

create policy "visits_owner_update" on visits
  for update using (
    exists (select 1 from users u where u.id = visits.user_id and u.user_id = auth.uid())
  ) with check (
    exists (select 1 from users u where u.id = visits.user_id and u.user_id = auth.uid())
  );

create policy "visits_owner_delete" on visits
  for delete using (
    exists (select 1 from users u where u.id = visits.user_id and u.user_id = auth.uid())
  );

-- visits_v1_read (select using (true)) is unchanged — discovery stays public.

-- CONNECTION_REQUESTS -----------------------------------------------------
drop policy if exists "connection_requests_v1_write" on connection_requests;
drop policy if exists "connection_requests_v1_read" on connection_requests;

create policy "connection_requests_owner_read" on connection_requests
  for select using (
    exists (
      select 1 from users u
      where (u.id = connection_requests.sender_id or u.id = connection_requests.recipient_id)
        and u.user_id = auth.uid()
    )
  );

create policy "connection_requests_sender_insert" on connection_requests
  for insert with check (
    exists (select 1 from users u where u.id = connection_requests.sender_id and u.user_id = auth.uid())
  );

create policy "connection_requests_recipient_update" on connection_requests
  for update using (
    exists (select 1 from users u where u.id = connection_requests.recipient_id and u.user_id = auth.uid())
  ) with check (
    exists (select 1 from users u where u.id = connection_requests.recipient_id and u.user_id = auth.uid())
  );

-- PAYMENTS -----------------------------------------------------------------
drop policy if exists "payments_v1_write" on payments;
drop policy if exists "payments_v1_read" on payments;

create policy "payments_owner_read" on payments
  for select using (
    exists (select 1 from users u where u.id = payments.user_id and u.user_id = auth.uid())
  );

-- No client insert/update policy: payment rows are only ever written by the
-- Stripe webhook handler, which uses the service-role key and bypasses RLS.

-- ACTIVITY_LOGS --------------------------------------------------------
drop policy if exists "activity_logs_v1_write" on activity_logs;
drop policy if exists "activity_logs_v1_read" on activity_logs;

create policy "activity_logs_owner_read" on activity_logs
  for select using (
    exists (select 1 from users u where u.id = activity_logs.user_id and u.user_id = auth.uid())
  );

create policy "activity_logs_owner_insert" on activity_logs
  for insert with check (
    exists (select 1 from users u where u.id = activity_logs.user_id and u.user_id = auth.uid())
  );
