import facts from '@/data/home/village-facts.json'

/* A small living card, not a weather dashboard.

   Source: Open-Meteo. It needs no account and no API key, so nothing secret exists to
   leak — the request is made on the server anyway and only the resolved values reach
   the browser. The coordinate is the place marker carried in the legacy village
   record's own map link for Guneku; the provenance is recorded in village-facts.json.

   If the call fails the card simply does not render. Nothing is ever hard-coded. */

type Weather = { temp: number; high: number | null; low: number | null; code: number; time: string }

const CONDITION: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 80: 'Light showers', 81: 'Showers',
  82: 'Heavy showers', 95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
}

async function getWeather(): Promise<Weather | null> {
  const { lat, lng } = facts.location
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min` +
    `&timezone=Africa%2FDouala&forecast_days=1`
  try {
    /* Revalidated hourly: current enough to be useful, light enough to be polite. */
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const d = await res.json()
    const t = d?.current?.temperature_2m
    if (typeof t !== 'number') return null
    return {
      temp: Math.round(t),
      high: typeof d?.daily?.temperature_2m_max?.[0] === 'number' ? Math.round(d.daily.temperature_2m_max[0]) : null,
      low: typeof d?.daily?.temperature_2m_min?.[0] === 'number' ? Math.round(d.daily.temperature_2m_min[0]) : null,
      code: Number(d?.current?.weather_code ?? -1),
      time: String(d?.current?.time ?? ''),
    }
  } catch {
    return null
  }
}

export async function GunekuToday() {
  const w = await getWeather()
  if (!w) return null

  const condition = CONDITION[w.code] ?? null
  const updated = w.time
    ? new Date(w.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Douala' })
    : null

  return (
    <div className="inst-card flex items-center gap-5 p-5">
      <div>
        <p className="inst-tag">Guneku today</p>
        <p className="mt-1.5 font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-none text-[var(--royal-green)]">
          {w.temp}°<span className="text-[1.2rem] align-top">C</span>
        </p>
      </div>
      <div className="min-w-0">
        {condition && <p className="inst-h3">{condition}</p>}
        {(w.high !== null || w.low !== null) && (
          <p className="inst-body mt-1 !text-[0.86rem]">
            {w.high !== null && <>High {w.high}°</>}
            {w.high !== null && w.low !== null && ' · '}
            {w.low !== null && <>Low {w.low}°</>}
          </p>
        )}
        <p className="inst-meta mt-1.5">
          {facts.location.label}
          {updated && <> · {updated} local</>}
        </p>
      </div>
    </div>
  )
}
