This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase Profile Linkage

To link `public.profiles` with `auth.users` and auto-create a profile when a user signs up, run these SQL statements in the Supabase SQL editor:

```sql
-- 1) Create profiles table linked to auth.users
create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	display_name text,
	full_name text,
	username text unique,
	avatar_url text,
	background_url text,
	created_at timestamp with time zone default now(),
	updated_at timestamp with time zone default now()
);

-- 2) Keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger as $$
begin
	new.updated_at = now();
	return new;
end;$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- 3) Create a trigger to insert a profile when a user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
	insert into public.profiles (id, full_name, username, avatar_url)
	values (
		new.id,
		coalesce(new.raw_user_meta_data->>'full_name', null),
		coalesce(new.raw_user_meta_data->>'username', null),
		coalesce(new.raw_user_meta_data->>'avatar_url', null)
	)
	on conflict (id) do nothing;
	return new;
end;$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 4) RLS for profiles
alter table public.profiles enable row level security;
create policy "Profiles are viewable by owner" on public.profiles
	for select using (auth.uid() = id);
create policy "Profiles are updatable by owner" on public.profiles
	for update using (auth.uid() = id);
```

The sign-up form sends `full_name`, `username`, and `avatar_url` as `user_metadata`, so the trigger populates `public.profiles` automatically.
