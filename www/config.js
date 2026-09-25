// Filled in during setup. Both values are PUBLIC by design (Supabase "Project URL" and
// "publishable"/anon key). They cannot read the device list on their own — the database
// is locked and only the server functions can touch it. No secrets belong in this file.
window.APP_CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
  SUPABASE_KEY: 'YOUR-PUBLISHABLE-KEY',
  MAX_OFFLINE_DAYS: 30
};
