-- CPWD Rate Finder — device approval database
-- Paste this whole file into Supabase → SQL Editor → Run. Safe to run more than once.

create extension if not exists pgcrypto;

-- One row per phone that has asked for access.
create table if not exists public.devices (
  id           uuid primary key default gen_random_uuid(),
  device_id    text not null unique,           -- random ID the app creates on first launch
  secret_hash  text not null,                  -- SHA-256 of the device's secret (the secret itself never leaves the phone)
  token_hash   text,                           -- SHA-256 of the access token issued after approval
  name         text not null,
  phone        text not null,
  email        text,
  model        text,
  platform     text,
  status       text not null default 'pending'
               check (status in ('pending', 'approved', 'rejected', 'revoked')),
  created_at   timestamptz not null default now(),
  decided_at   timestamptz,
  decided_via  text,                           -- 'email' or 'admin'
  last_seen    timestamptz
);

create index if not exists devices_status_idx on public.devices (status);

-- One-time APPROVE / REJECT links sent by email. Only the hash of each link is stored.
create table if not exists public.action_tokens (
  token_hash  text primary key,
  device_row  uuid not null references public.devices(id) on delete cascade,
  action      text not null check (action in ('approve', 'reject')),
  expires_at  timestamptz not null,
  used_at     timestamptz
);

create index if not exists action_tokens_device_idx on public.action_tokens (device_row);

-- Lock both tables. Row Level Security is ON and there are NO policies,
-- so the app's public key cannot read or change anything directly.
-- Only the server functions (which use the secret service key) can.
alter table public.devices       enable row level security;
alter table public.action_tokens enable row level security;

revoke all on public.devices       from anon, authenticated;
revoke all on public.action_tokens from anon, authenticated;

-- The server functions use the service role; make sure it can use the tables
-- even when "automatically expose new tables" is turned off.
grant usage on schema public to service_role;
grant select, insert, update, delete on public.devices       to service_role;
grant select, insert, update, delete on public.action_tokens to service_role;
