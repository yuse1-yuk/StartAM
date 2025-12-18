'use client';

import { useEffect, useMemo, useState } from "react";

type WeatherState =
  | { status: "idle" | "locating" | "loading" }
  | { status: "ready"; data: WeatherData }
  | { status: "error"; message: string };

type WeatherData = {
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  locationLabel: string;
};

export function WeatherCard() {
  const [state, setState] = useState<WeatherState>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async (lat: number, lon: number, label: string) => {
      setState({ status: "loading" });
      try {
        const res = await fetch(
          `/api/weather?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("取得に失敗しました");
        }

        const payload = await res.json();
        if (cancelled) return;
        setState({
          status: "ready",
          data: {
            temperature: payload.temperature,
            apparentTemperature: payload.apparentTemperature,
            precipitationProbability: payload.precipitationProbability,
            windSpeed: payload.windSpeed,
            weatherCode: payload.weatherCode,
            weatherDescription: describeWeather(payload.weatherCode),
            locationLabel: label,
          },
        });
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setState({
            status: "error",
            message: "天気情報の取得に失敗しました",
          });
        }
      }
    };

    const requestLocation = () => {
      setState({ status: "locating" });
      if (!("geolocation" in navigator)) {
        fetch(`/api/weather`, { cache: "no-store" })
          .then((res) => res.json())
          .then((payload) =>
            setState({
              status: "ready",
              data: {
                temperature: payload.temperature,
                apparentTemperature: payload.apparentTemperature,
                precipitationProbability: payload.precipitationProbability,
                windSpeed: payload.windSpeed,
                weatherCode: payload.weatherCode,
                weatherDescription: describeWeather(payload.weatherCode),
                locationLabel: "デフォルト地点",
              },
            })
          )
          .catch(() =>
            setState({
              status: "error",
              message: "天気情報の取得に失敗しました",
            })
          );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude, "現在地から取得");
        },
        () =>
          fetch(`/api/weather`, { cache: "no-store" })
            .then((res) => res.json())
            .then((payload) =>
              setState({
                status: "ready",
                data: {
                  temperature: payload.temperature,
                  apparentTemperature: payload.apparentTemperature,
                  precipitationProbability: payload.precipitationProbability,
                  windSpeed: payload.windSpeed,
                  weatherCode: payload.weatherCode,
                  weatherDescription: describeWeather(payload.weatherCode),
                  locationLabel: "デフォルト地点",
                },
              })
            )
            .catch(() =>
              setState({
                status: "error",
                message: "天気情報の取得に失敗しました",
              })
            ),
        {
          enableHighAccuracy: false,
          maximumAge: 10 * 60 * 1000,
          timeout: 5000,
        }
      );
    };

    requestLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  const highlight = useMemo(() => {
    if (state.status !== "ready") return { emoji: "☀️", label: "読み込み中" };
    switch (true) {
      case state.data.precipitationProbability >= 70:
        return { emoji: "🌧️", label: "傘を持って" };
      case state.data.temperature >= 30:
        return { emoji: "🔥", label: "暑さ注意" };
      case state.data.temperature <= 5:
        return { emoji: "🧥", label: "冷え込み" };
      default:
        return { emoji: "🙂", label: "快適" };
    }
  }, [state]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl shadow-2xl sm:p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 via-transparent to-sky-400/15" />
      <div className="relative flex flex-col gap-6">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">
              Weather
            </p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-4xl font-semibold text-white sm:text-5xl">
                {state.status === "ready"
                  ? Math.round(state.data.temperature)
                  : "—"}
                °
              </span>
              <span className="text-sm text-white/70">
                体感{" "}
                {state.status === "ready"
                  ? Math.round(state.data.apparentTemperature)
                  : "—"}
                °
              </span>
            </div>
            <p className="mt-2 text-lg text-white/80">
              {state.status === "ready"
                ? state.data.weatherDescription
                : state.status === "error"
                  ? "取得エラー"
                  : "位置情報から取得中"}
            </p>
            <p className="text-sm text-white/60">
              {state.status === "ready"
                ? state.data.locationLabel
                : state.status === "error"
                  ? "再読み込みしてみてください"
                  : "許可されている場合は現在地を利用します"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-right text-white/80">
            <span className="text-xl">{highlight.emoji}</span>
            <span className="text-xs uppercase tracking-wide">
              {highlight.label}
            </span>
          </div>
        </header>

        <dl className="grid grid-cols-3 gap-3 text-sm text-white/80">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <dt className="text-white/60">降水確率</dt>
            <dd className="mt-1 text-xl font-semibold text-white">
              {state.status === "ready"
                ? `${Math.round(state.data.precipitationProbability)}%`
                : "—"}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <dt className="text-white/60">風速</dt>
            <dd className="mt-1 text-xl font-semibold text-white">
              {state.status === "ready"
                ? `${state.data.windSpeed.toFixed(1)} m/s`
                : "—"}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <dt className="text-white/60">状況</dt>
            <dd className="mt-1 text-xl font-semibold text-white">
              {state.status === "ready"
                ? state.data.weatherDescription
                : "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function describeWeather(code: number) {
  if (code === 0) return "快晴";
  if ([1, 2].includes(code)) return "晴れ";
  if (code === 3) return "くもり";
  if ([45, 48].includes(code)) return "霧";
  if ([51, 53, 55].includes(code)) return "霧雨";
  if ([56, 57].includes(code)) return "冷たい霧雨";
  if ([61, 63, 65].includes(code)) return "雨";
  if ([66, 67].includes(code)) return "冷たい雨";
  if ([71, 73, 75].includes(code)) return "雪";
  if ([77].includes(code)) return "雪の結晶";
  if ([80, 81, 82].includes(code)) return "にわか雨";
  if ([85, 86].includes(code)) return "にわか雪";
  if ([95].includes(code)) return "雷雨";
  if ([96, 99].includes(code)) return "雹を伴う雷雨";
  return "不明";
}
