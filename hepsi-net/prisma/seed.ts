import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo data...");

  // Clear existing data
  await prisma.contentVersion.deleteMany({});
  await prisma.contentDraft.deleteMany({});
  await prisma.keywordMatch.deleteMany({});
  await prisma.keyword.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.editorialStatusHistory.deleteMany({});
  await prisma.storyClusterMember.deleteMany({});
  await prisma.newsStory.deleteMany({});
  await prisma.storyCluster.deleteMany({});
  await prisma.ingestionRun.deleteMany({});
  await prisma.newsSource.deleteMany({});

  // Sources
  const sourceData = [
    { name: "Haberturk", domain: "haberturk.com", type: "RSS", feedUrl: "https://www.haberturk.com/rss", priority: 9 },
    { name: "CNN Türk", domain: "cnnturk.com", type: "RSS", feedUrl: "https://www.cnnturk.com/feed/rss/guncel/news", priority: 9 },
    { name: "Sabah", domain: "sabah.com.tr", type: "RSS", feedUrl: "https://www.sabah.com.tr/rss/anasayfa.xml", priority: 8 },
    { name: "Hürriyet", domain: "hurriyet.com.tr", type: "RSS", feedUrl: "https://www.hurriyet.com.tr/rss/anasayfa", priority: 8 },
    { name: "Cumhuriyet", domain: "cumhuriyet.com.tr", type: "RSS", feedUrl: "https://www.cumhuriyet.com.tr/rss/son_dakika.xml", priority: 7 },
    { name: "NTV", domain: "ntv.com.tr", type: "RSS", feedUrl: "https://www.ntv.com.tr/son-dakika.rss", priority: 7 },
    { name: "TRT Haber", domain: "trthaber.com", type: "RSS", feedUrl: "https://www.trthaber.com/sondakika.rss", priority: 8 },
    { name: "Sözcü", domain: "sozcu.com.tr", type: "RSS", feedUrl: "https://www.sozcu.com.tr/rss/gundem.xml", priority: 7 },
  ];

  const createdSources: Record<string, string> = {};
  for (const src of sourceData) {
    const s = await prisma.newsSource.create({ data: { ...src, isDemo: true } });
    createdSources[src.domain] = s.id;
  }

  const now = new Date();
  const m = (mins: number) => new Date(now.getTime() - mins * 60 * 1000);

  const storyData = [
    {
      sourceId: createdSources["haberturk.com"],
      url: "https://demo.aa.com.tr/story/001",
      headline: "Cumhurbaşkanı Erdoğan: Enflasyonla mücadelede kararlılığımız sürecek",
      snippet: "Cumhurbaşkanı Recep Tayyip Erdoğan, ekonomik reformların kararlılıkla sürdürüleceğini ve enflasyonun düşürülmesi için gerekli adımların atılacağını açıkladı. Erdoğan, yapısal reformların önümüzdeki dönemde de devam edeceğini vurguladı.",
      publishedAt: m(5),
      category: "Siyaset",
      importanceScore: 85,
      isBreaking: true,
      factWhat: "Cumhurbaşkanı Erdoğan enflasyonla mücadele konusunda açıklama yaptı",
      factWhere: "Ankara, Cumhurbaşkanlığı Külliyesi",
      factWhen: "Bugün",
      factWho: "Cumhurbaşkanı Recep Tayyip Erdoğan",
      factResult: "Reformların süreceği taahhüt edildi",
    },
    {
      sourceId: createdSources["cnnturk.com"],
      url: "https://demo.cnnturk.com/story/002",
      headline: "Merkez Bankası faiz kararını açıkladı: Politika faizi yüzde 50'de sabit",
      snippet: "Türkiye Cumhuriyet Merkez Bankası, mayıs ayı para politikası toplantısında politika faizini yüzde 50'de sabit bıraktı. Kurul, enflasyonun düşüş eğilimine girene kadar sıkı para politikasını sürdüreceğini bildirdi.",
      publishedAt: m(12),
      category: "Ekonomi",
      importanceScore: 92,
      isBreaking: true,
      factWhat: "Merkez Bankası faiz kararını açıkladı",
      factWhere: "Ankara",
      factWhen: "Bugün öğleden sonra",
      factWho: "Türkiye Cumhuriyet Merkez Bankası Para Politikası Kurulu",
      factResult: "Politika faizi yüzde 50'de sabit tutuldu",
    },
    {
      sourceId: createdSources["sabah.com.tr"],
      url: "https://demo.sabah.com.tr/story/003",
      headline: "İstanbul'da büyük trafik kazası: 3 yaralı",
      snippet: "İstanbul'un Kadıköy ilçesinde meydana gelen trafik kazasında 3 kişi yaralandı. Kazada 2 araç birbirine girdi. Yaralılar ambulanslarla hastaneye kaldırıldı.",
      publishedAt: m(18),
      category: "Türkiye",
      importanceScore: 55,
      isBreaking: false,
      factWhat: "Trafik kazası meydana geldi",
      factWhere: "İstanbul, Kadıköy",
      factWhen: "Bugün",
      factWho: null,
      factResult: "3 kişi yaralandı, hastaneye kaldırıldı",
    },
    {
      sourceId: createdSources["hurriyet.com.tr"],
      url: "https://demo.hurriyet.com.tr/story/004",
      headline: "Türkiye-Rusya ilişkilerinde yeni dönem: Dışişleri Bakanı Fidan Moskova'da",
      snippet: "Dışişleri Bakanı Hakan Fidan, ikili ilişkileri ve bölgesel gelişmeleri görüşmek üzere Moskova'ya gitti. Fidan, Rus mevkidaşı Lavrov ile bir araya gelecek.",
      publishedAt: m(25),
      category: "Dünya",
      importanceScore: 78,
      isBreaking: false,
      factWhat: "Dışişleri Bakanı Fidan Moskova ziyaretinde",
      factWhere: "Moskova, Rusya",
      factWhen: "Bugün",
      factWho: "Dışişleri Bakanı Hakan Fidan, Rus Dışişleri Bakanı Sergey Lavrov",
      factResult: "İkili görüşme yapılacak",
    },
    {
      sourceId: createdSources["ntv.com.tr"],
      url: "https://demo.ntv.com.tr/story/005",
      headline: "Yapay zeka düzenlemesi Meclis'ten geçti: Türkiye'de ilk",
      snippet: "TBMM Genel Kurulu, yapay zeka kullanımını düzenleyen yasa tasarısını kabul etti. Yasa, yapay zeka sistemlerinin denetlenmesi ve şeffaflık ilkelerini belirliyor.",
      publishedAt: m(35),
      category: "Teknoloji",
      importanceScore: 72,
      isBreaking: false,
      factWhat: "Yapay zeka düzenleme yasası Meclis'ten geçti",
      factWhere: "TBMM, Ankara",
      factWhen: "Bugün",
      factWho: "TBMM Genel Kurulu",
      factResult: "Yasa kabul edildi",
    },
    {
      sourceId: createdSources["trthaber.com"],
      url: "https://demo.trthaber.com/story/006",
      headline: "Galatasaray Şampiyonlar Ligi'nde gruplara kaldı",
      snippet: "UEFA Şampiyonlar Ligi'nde Galatasaray, play-off turunda rakibini 2-1 mağlup ederek grup aşamasına kalmayı garantiledi.",
      publishedAt: m(45),
      category: "Spor",
      importanceScore: 68,
      isBreaking: false,
      factWhat: "Galatasaray Şampiyonlar Ligi grup aşamasına kaldı",
      factWhere: "İstanbul, Ali Sami Yen Stadyumu",
      factWhen: "Dün gece",
      factWho: "Galatasaray",
      factResult: "2-1 galibiyet ile grup aşamasına kalındı",
    },
    {
      sourceId: createdSources["sozcu.com.tr"],
      url: "https://demo.sozcu.com.tr/story/007",
      headline: "Sağlık Bakanı'ndan ilaç krizi açıklaması: 'Durum kontrol altında'",
      snippet: "Sağlık Bakanı Kemal Memişoğlu, bazı ilaçlarda yaşanan temin güçlüğüne ilişkin açıklama yaptı. Bakan, gerekli adımların atıldığını ve durumun kontrol altında olduğunu belirtti.",
      publishedAt: m(58),
      category: "Sağlık",
      importanceScore: 65,
      isBreaking: false,
      factWhat: "Sağlık Bakanı ilaç temin sorununa ilişkin açıklama yaptı",
      factWhere: "Ankara",
      factWhen: "Bugün",
      factWho: "Sağlık Bakanı Kemal Memişoğlu",
      factResult: "Durumun kontrol altında olduğu belirtildi",
    },
    {
      sourceId: createdSources["cumhuriyet.com.tr"],
      url: "https://demo.milliyet.com.tr/story/008",
      headline: "Deprem: Kahramanmaraş'ta 3.8 büyüklüğünde sarsıntı",
      snippet: "Kahramanmaraş'ta 3.8 büyüklüğünde deprem meydana geldi. AFAD'ın ilk açıklamasına göre herhangi bir hasar veya yaralanma bildirilmedi.",
      publishedAt: m(72),
      category: "Türkiye",
      importanceScore: 60,
      isBreaking: false,
      factWhat: "Deprem meydana geldi",
      factWhere: "Kahramanmaraş",
      factWhen: "Bugün sabah",
      factWho: null,
      factResult: "3.8 büyüklüğünde, hasar bildirilmedi",
    },
    {
      sourceId: createdSources["haberturk.com"],
      url: "https://demo.aa.com.tr/story/009",
      headline: "ÖSYM, YKS başvuru tarihlerini açıkladı",
      snippet: "ÖSYM, 2025-2026 eğitim yılı Yükseköğretim Kurumları Sınavı başvurularının tarihleri belirlendi. Başvurular önümüzdeki ay başlıyor.",
      publishedAt: m(90),
      category: "Eğitim",
      importanceScore: 45,
      isBreaking: false,
      factWhat: "YKS başvuru tarihleri açıklandı",
      factWhere: "Ankara",
      factWhen: "Bugün",
      factWho: "ÖSYM",
      factResult: "Başvurular önümüzdeki ay başlayacak",
    },
    {
      sourceId: createdSources["cnnturk.com"],
      url: "https://demo.cnnturk.com/story/010",
      headline: "Dolarda son durum: Dolar/TL 32,80 seviyesinde seyrediyor",
      snippet: "Dolar/TL kuru bugün piyasalarda 32,80 seviyelerinde işlem görüyor. Euro/TL ise 35,10 civarında seyrediyor.",
      publishedAt: m(15),
      category: "Ekonomi",
      importanceScore: 58,
      isBreaking: false,
      factWhat: "Döviz kuru güncellendi",
      factWhere: null,
      factWhen: "Bugün",
      factWho: null,
      factResult: "Dolar/TL: 32,80, Euro/TL: 35,10",
    },
    {
      sourceId: createdSources["trthaber.com"],
      url: "https://demo.trthaber.com/story/011",
      headline: "Merkez Bankası faiz kararı: Piyasalar tepkisini gösterdi",
      snippet: "Merkez Bankası'nın faiz kararının ardından borsa ve döviz piyasaları hareketlendi. Karar beklendiği yönde çıktı.",
      publishedAt: m(20),
      category: "Ekonomi",
      importanceScore: 75,
      isBreaking: false,
      factWhat: "Piyasalar faiz kararına tepki verdi",
      factWhere: "İstanbul Borsası",
      factWhen: "Bugün",
      factWho: null,
      factResult: "Piyasalarda hareket gözlemlendi",
    },
    {
      sourceId: createdSources["sabah.com.tr"],
      url: "https://demo.sabah.com.tr/story/012",
      headline: "Beşiktaş-Fenerbahçe derbisi için bilet satışları başladı",
      snippet: "Süper Lig'in en çok beklenen maçlarından Beşiktaş-Fenerbahçe derbisi için bilet satışları başladı. Karşılaşma 15 gün sonra oynanacak.",
      publishedAt: m(110),
      category: "Spor",
      importanceScore: 38,
      isBreaking: false,
      factWhat: "Beşiktaş-Fenerbahçe derbisi için bilet satışları başladı",
      factWhere: "Vodafone Park, İstanbul",
      factWhen: "15 gün sonra",
      factWho: "Beşiktaş, Fenerbahçe",
      factResult: "Bilet satışları başladı",
    },
  ];

  const createdStories: { id: string; headline: string }[] = [];
  for (const story of storyData) {
    if (!story.sourceId) continue;
    const s = await prisma.newsStory.create({
      data: { ...story, isDemo: true, trendScore: Math.floor(Math.random() * 50) },
    });
    createdStories.push({ id: s.id, headline: s.headline });
  }

  // Cluster the two Merkez Bankası stories
  const mk1 = createdStories.find((s) => s.headline.includes("Merkez Bankası faiz kararını açıkladı"));
  const mk2 = createdStories.find((s) => s.headline.includes("Piyasalar faiz kararına tepki"));
  if (mk1 && mk2) {
    const cluster = await prisma.storyCluster.create({
      data: { primaryHeadline: "Merkez Bankası Faiz Kararı", sourceCount: 2, isDemo: true },
    });
    await prisma.storyClusterMember.create({ data: { clusterId: cluster.id, storyId: mk1.id } });
    await prisma.storyClusterMember.create({ data: { clusterId: cluster.id, storyId: mk2.id } });
    await prisma.newsStory.update({ where: { id: mk1.id }, data: { clusterId: cluster.id } });
    await prisma.newsStory.update({ where: { id: mk2.id }, data: { clusterId: cluster.id } });
  }

  // Keywords
  const keywordData = [
    { term: "Cumhurbaşkanı", priority: "CRITICAL", color: "#E8192C", weight: 10 },
    { term: "deprem", priority: "HIGH", color: "#F59E0B", weight: 9 },
    { term: "NATO", priority: "HIGH", color: "#3B82F6", weight: 8 },
    { term: "Merkez Bankası", priority: "HIGH", color: "#F59E0B", weight: 8 },
    { term: "ÖSYM", priority: "NORMAL", color: "#22C55E", weight: 6 },
    { term: "Galatasaray", priority: "NORMAL", color: "#F59E0B", weight: 5 },
    { term: "yapay zeka", priority: "NORMAL", color: "#8B5CF6", weight: 6 },
    { term: "faiz", priority: "HIGH", color: "#F59E0B", weight: 7 },
  ];
  for (const kw of keywordData) {
    await prisma.keyword.create({ data: { ...kw, isDemo: true } });
  }

  // Notifications
  const notifData = [
    { type: "BREAKING", title: "Kritik haber tespit edildi", body: "Merkez Bankası faiz kararı — Önem skoru: 92" },
    { type: "KEYWORD_MATCH", title: 'Anahtar kelime eşleşti: "Merkez Bankası"', body: "Merkez Bankası faiz kararını açıkladı: Politika faizi yüzde 50'de sabit" },
    { type: "CLUSTER", title: "Aynı haber 2 farklı kaynaktan", body: "Merkez Bankası faiz kararı haberi gruplanıyor" },
    { type: "KEYWORD_MATCH", title: 'Anahtar kelime eşleşti: "Cumhurbaşkanı"', body: "Cumhurbaşkanı Erdoğan: Enflasyonla mücadelede kararlılığımız sürecek" },
  ];
  for (const n of notifData) {
    await prisma.notification.create({ data: { ...n, isDemo: true } });
  }

  // App settings
  const settings = [
    { key: "site_name", value: "HEPSİ NET" },
    { key: "timezone", value: "Europe/Istanbul" },
    { key: "ingest_interval_ms", value: "300000" },
    { key: "hashtag_count", value: "3" },
    { key: "ai_model", value: "claude-sonnet-5" },
    { key: "prohibited_phrases", value: JSON.stringify(["gündem oldu", "sosyal medyayı salladı", "bomba gibi düştü"]) },
  ];
  for (const s of settings) {
    await prisma.appSetting.upsert({ where: { key: s.key }, create: s, update: { value: s.value } });
  }

  console.log("✅ Demo seed complete");
  console.log(`   ${Object.keys(createdSources).length} kaynaklar`);
  console.log(`   ${createdStories.length} haberler`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
