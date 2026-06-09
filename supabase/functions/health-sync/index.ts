// Supabase Edge Function: health-sync
// Receives Apple Health data from iOS Shortcut and merges it into daily_logs.
// Only updates health fields — never overwrites manually entered cal_in, weight, protein, etc.
//
// POST body: { sync_token, date, steps, active_calories, resting_calories, distance_miles, workout_minutes }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const {
      sync_token,
      date,
      steps,
      active_calories,
      resting_calories,
      distance_miles,
      workout_minutes
    } = body

    // Validate required fields
    if (!sync_token || !date) {
      return new Response(
        JSON.stringify({ error: 'sync_token and date are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Response(
        JSON.stringify({ error: 'date must be YYYY-MM-DD format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Authenticate via sync token — look up the user
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('sync_token', sync_token)
      .maybeSingle()

    if (profileErr || !profile) {
      return new Response(
        JSON.stringify({ error: 'Invalid sync token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const uid = profile.id
    const month_key = date.substring(0, 7) // "YYYY-MM"

    // total cal burned = active + resting (this is what goes in cal_out for deficit calc)
    const active = active_calories != null ? Math.round(active_calories) : null
    const resting = resting_calories != null ? Math.round(resting_calories) : null
    const total_cal_out = (active != null && resting != null)
      ? active + resting
      : (active ?? resting ?? null)

    // Build the health data object — only include fields that were actually sent
    const healthData: Record<string, unknown> = {}
    if (steps != null)          healthData.steps = Math.round(steps)
    if (total_cal_out != null)  healthData.cal_out = total_cal_out
    if (active != null)         healthData.active_cal_out = active
    if (distance_miles != null) healthData.running_distance = Math.round(distance_miles * 100) / 100
    if (workout_minutes != null) healthData.workout_mins = Math.round(workout_minutes)

    if (Object.keys(healthData).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No health fields provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if an entry already exists for this date
    const { data: existing } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('user_id', uid)
      .eq('date', date)
      .maybeSingle()

    let error
    if (existing) {
      // UPDATE — only touch health fields, leave cal_in / weight / protein / notes alone
      ;({ error } = await supabase
        .from('daily_logs')
        .update(healthData)
        .eq('user_id', uid)
        .eq('date', date))
    } else {
      // INSERT — new row for this date
      ;({ error } = await supabase
        .from('daily_logs')
        .insert({ user_id: uid, date, month_key, ...healthData }))
    }

    if (error) throw error

    return new Response(
      JSON.stringify({
        success: true,
        date,
        action: existing ? 'updated' : 'inserted',
        fields_synced: Object.keys(healthData)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
