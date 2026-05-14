// auth.js — shared auth logic
let _supabase = null;

function getClient() {
  if (!_supabase) {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, SUPABASE_OPTIONS);
  }
  return _supabase;
}

async function requireAuth() {
  const sb = getClient();
  // Try to restore session from storage first
  const { data: { session }, error } = await sb.auth.getSession();
  if (!session) {
    // Try refreshing in case token expired
    const { data: refreshed } = await sb.auth.refreshSession();
    if (!refreshed.session) {
      window.location.href = '/login.html';
      return null;
    }
    return refreshed.session;
  }
  return session;
}

async function getProfile() {
  const sb = getClient();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;
  const { data } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
  return data;
}

async function signOut() {
  await getClient().auth.signOut();
  window.location.href = '/index.html';
}

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [y, m] = key.split('-');
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${months[parseInt(m) - 1]} ${y}`;
}
