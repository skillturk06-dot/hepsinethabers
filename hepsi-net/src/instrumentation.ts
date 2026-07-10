export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runIngestion } = await import("./lib/ingestion/engine");

    const INTERVAL_MS = parseInt(process.env.INGEST_INTERVAL_MS ?? "300000"); // 5 dakika

    // Uygulama başladığında ilk çekimi yap
    setTimeout(() => {
      console.log("[Auto-Ingest] İlk haber çekimi başlatılıyor...");
      runIngestion().catch((e) => console.error("[Auto-Ingest] Hata:", e));
    }, 5000);

    // Sonraki çekimleri zamanla
    setInterval(() => {
      console.log("[Auto-Ingest] Zamanlanmış haber çekimi...");
      runIngestion().catch((e) => console.error("[Auto-Ingest] Hata:", e));
    }, INTERVAL_MS);

    console.log(`[Auto-Ingest] Zamanlayıcı başlatıldı — her ${INTERVAL_MS / 60000} dakikada bir`);
  }
}
