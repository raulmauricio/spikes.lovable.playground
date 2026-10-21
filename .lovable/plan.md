# Google Sign-In and Registered Users Table

## Current state
- No backend is connected yet; the "Google Login" tab only shows its title.
- Prompts and AI Data tabs stay untouched.

## What the user will see (Google Login tab)
- Signed out: a single black "Continue with Google" button.
- Signed in: name, email and a "Sign out" link.
- Admins additionally see a minimal table: Full name, Email, Registration date.
- Regular users see a short note that the list is admin-only.
- Loading (subtle skeleton rows), empty ("No users yet"), and error states.
- Table scrolls horizontally on small screens; black/white/gray only.

## Steps
1. Enable Lovable Cloud (managed Google sign-in works out of the box, no Google Console setup needed for the preview).
2. Turn on the Google provider.
3. Database:
   - `profiles` table: id (linked to the account), full_name, email, provider, created_at.
   - Trigger on new account: inserts a profile only when the sign-in provider is Google.
   - `user_roles` table + `has_role()` check (roles kept separate from profiles to prevent privilege escalation).
   - The first Google user to register becomes admin automatically; later users are regular.
4. Access rules (RLS):
   - Users can read only their own profile.
   - Admins can read all profiles.
   - Nobody can write roles from the app.
5. Build the Google Login tab UI with the states above, reading the list through the signed-in user's session so rules are enforced server-side.

## Manual configuration
- None required for testing. Optional later: your own Google OAuth client ID/secret in Cloud auth settings for custom branding on the consent screen.
- To make someone else admin later, it can be done from Cloud's database view (I can help).

## Technical details
- Google sign-in via the `lovable.auth.signInWithOAuth("google")` broker, redirect back to `/`.
- Single `onAuthStateChange` listener in the root route.
- Grants: `profiles` SELECT to authenticated; `user_roles` SELECT to authenticated; ALL to service_role. No anon access.
- Admin-first trigger is `security definer`; no service-role key in frontend.
