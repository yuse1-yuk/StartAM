import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");

  const defaultLat =
    process.env.WEATHER_DEFAULT_LAT ?? "35.681236"; // Tokyo
  const defaultLon =
    process.env.WEATHER_DEFAULT_LON ?? "139.767125";

  const lat = latParam ? Number(latParam) : Number(defaultLat);
  const lon = lonParam ? Number(lonParam) : Number(defaultLon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json(
      { error: "lat と lon を指定してください" },
      { status: 400 }
    );
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode&current_weather=true&forecast_days=1&timezone=auto`;

  const res = await fetch(url, { next: { revalidate: 600 } });

  if (!res.ok) {
    return NextResponse.json(
      { error: "天気情報の取得に失敗しました" },
      { status: 502 }
    );
  }

  const data = await res.json();
  const nowIsoHour = new Date().toISOString().slice(0, 13); // 2024-01-01T09
  const today = new Date().toISOString().slice(0, 10);

  const currentWeather = data.current_weather;
  const hourlyTime: string[] = data.hourly?.time ?? [];
  const hourlyApparent: number[] = data.hourly?.apparent_temperature ?? [];
  const hourlyPrec: number[] = data.hourly?.precipitation_probability ?? [];

  const currentIndex = hourlyTime.findIndex((t) => t.startsWith(nowIsoHour));
  const apparentTemperature =
    currentIndex >= 0 ? hourlyApparent[currentIndex] : currentWeather?.temperature;

  const precipitationProbability = hourlyTime.reduce((max, time, index) => {
    if (!time.startsWith(today)) return max;
    const value = hourlyPrec[index] ?? 0;
    return value > max ? value : max;
  }, 0);

  return NextResponse.json({
    source: "open-meteo",
    lat,
    lon,
    temperature: currentWeather?.temperature ?? null,
    apparentTemperature,
    precipitationProbability,
    windSpeed: currentWeather?.windspeed ?? null,
    weatherCode: currentWeather?.weathercode ?? null,
    timestamp: currentWeather?.time ?? null,
  });
}
