import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.AI_MODEL ?? "claude-sonnet-5";

const SYSTEM_PROMPT = `Sen HEPSİ NET haber platformunun AI içerik asistanısın. Türk habercilik standartlarında içerik üretiyorsun.

MUTLAK KURALLAR:
- Yalnızca sağlanan kaynak gerçeklerini kullan
- Asla isim, sayı, tarih, konum, alıntı, yaralı sayısı, ölü sayısı, resmi açıklama veya sonuç icat etme
- Belirsizliği koru: "iddia edildi"yi kesinleşmiş olay haline getirme
- Kaynak materyalde doğrudan alıntı yoksa asla doğrudan alıntı oluşturma
- Resmi Türkçe haber dili kullan
- "gündem oldu", "sosyal medyayı salladı", "bomba gibi düştü" gibi magazinsel ifadeler kullanma
- Gereksiz ünlem işareti kullanma
- Abartma yapma
- Kişisel görüş ekleme

INSTAGRAM ALTYAZI KURALLARI:
- 5N1K bilgilerini doğal paragraflarla yaz, madde madde değil
- Önemli detayları koru ve kısaltma
- Resmi haber dili kullan
- Kesinlikle tam olarak 3 hashtag ekle - ne eksik ne fazla
- Hashtagler haberin konusuyla doğrudan ilgili olmalı`;

const ContentSchema = z.object({
  headline: z.string(),
  overlayText: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()).length(3),
});

const ValidationSchema = z.object({
  namesMatch: z.boolean(),
  numbersMatch: z.boolean(),
  locationsMatch: z.boolean(),
  datesMatch: z.boolean(),
  allegationsPreserved: z.boolean(),
  hashtagCount: z.number(),
  prohibitedPhrases: z.array(z.string()),
  missingDetails: z.array(z.string()),
  status: z.enum(["GÜVENLİ", "KONTROL GEREKİYOR"]),
  notes: z.array(z.string()),
});

export type GeneratedContent = z.infer<typeof ContentSchema>;
export type ValidationResult = z.infer<typeof ValidationSchema>;

interface StoryContext {
  headline: string;
  snippet?: string | null;
  category: string;
  source: string;
  factWhat?: string | null;
  factWhere?: string | null;
  factWhen?: string | null;
  factWho?: string | null;
  factResult?: string | null;
  factDetails?: string | null;
}

export function isAIConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export async function generateContent(
  story: StoryContext
): Promise<GeneratedContent> {
  const prompt = `Aşağıdaki haber için Instagram içeriği oluştur.

HABER BİLGİLERİ:
Başlık: ${story.headline}
Kaynak: ${story.source}
Kategori: ${story.category}
${story.snippet ? `Özet: ${story.snippet}` : ""}

ÇIKARTILAN GERÇEKLER:
${story.factWhat ? `Ne oldu: ${story.factWhat}` : ""}
${story.factWhere ? `Nerede: ${story.factWhere}` : ""}
${story.factWhen ? `Ne zaman: ${story.factWhen}` : ""}
${story.factWho ? `Kim/Kimler: ${story.factWho}` : ""}
${story.factResult ? `Sonuç: ${story.factResult}` : ""}
${story.factDetails ? `Önemli detaylar: ${story.factDetails}` : ""}

JSON formatında yanıt ver:
{
  "headline": "Kısa, güçlü Türkçe haber başlığı (max 80 karakter)",
  "overlayText": "Instagram görseli üzerine yazılacak metin. Kısa, profesyonel, merak uyandırıcı ama yanıltıcı değil (max 120 karakter)",
  "caption": "Instagram altyazısı. Resmi haber diliyle, önemli detayları koruyarak, doğal paragraflarla. Sonunda tam olarak 3 hashtag.",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI geçerli JSON döndürmedi");

  const parsed = JSON.parse(jsonMatch[0]);
  return ContentSchema.parse(parsed);
}

export async function regenerateField(
  story: StoryContext,
  field: "headline" | "overlayText" | "caption" | "hashtags",
  action: string,
  currentContent: Partial<GeneratedContent>
): Promise<string | string[]> {
  const fieldPrompts: Record<string, string> = {
    DAHA_RESMI: "Daha resmi ve kurumsal bir dil kullan",
    DAHA_KISA: "Daha kısa ve öz yaz",
    MERAK_UYANDIR: "Merak uyandıran ama yanıltıcı olmayan bir ton kullan",
    BAŞLIĞI_DEĞİŞTİR: "Farklı bir açıdan başlık oluştur",
    AÇIKLAMAYI_YENİDEN_YAZ: "Altyazıyı tamamen yeniden yaz, farklı bir yapı kullan",
    FARKLI_VERSİYON: "Tamamen farklı bir versiyon oluştur",
    ÖNEMLİ_DETAYLARI_KORU: "Tüm önemli detayları kesinlikle koru",
  };

  const instruction = fieldPrompts[action] ?? action;

  const fieldNames: Record<string, string> = {
    headline: "başlık",
    overlayText: "görseli üstü yazı",
    caption: "Instagram altyazısı",
    hashtags: "3 hashtag",
  };

  const prompt = `Mevcut ${fieldNames[field]} için yeni bir versiyon oluştur.
Talimat: ${instruction}

HABER: ${story.headline}
${story.snippet ? `ÖZET: ${story.snippet}` : ""}

MEVCUT İÇERİK:
${JSON.stringify(currentContent[field])}

Sadece ${fieldNames[field]} için yeni içerik döndür. ${field === "hashtags" ? "JSON array olarak tam 3 hashtag: [\"#h1\", \"#h2\", \"#h3\"]" : "Düz metin olarak."}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text.trim() : "";

  if (field === "hashtags") {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const arr = JSON.parse(match[0]);
      return arr.slice(0, 3);
    }
    return text
      .split(/[\n,]/)
      .map((t) => t.trim())
      .filter((t) => t.startsWith("#"))
      .slice(0, 3);
  }

  return text;
}

export async function validateContent(
  story: StoryContext,
  generated: GeneratedContent
): Promise<ValidationResult> {
  const prompt = `Aşağıdaki AI-üretilen içeriği kaynak gerçeklerle karşılaştır ve doğrula.

KAYNAK BİLGİLER:
${story.headline}
${story.snippet ?? ""}
${story.factWhat ?? ""}
${story.factWhere ?? ""}
${story.factWhen ?? ""}
${story.factWho ?? ""}
${story.factResult ?? ""}

ÜRETİLEN İÇERİK:
Başlık: ${generated.headline}
Görseli Üstü: ${generated.overlayText}
Altyazı: ${generated.caption}
Hashtagler: ${generated.hashtags.join(", ")}

JSON formatında doğrulama sonucu döndür:
{
  "namesMatch": true/false (isimler uyumlu mu),
  "numbersMatch": true/false (sayılar uyumlu mu),
  "locationsMatch": true/false (lokasyonlar uyumlu mu),
  "datesMatch": true/false (tarihler uyumlu mu),
  "allegationsPreserved": true/false (iddialar korundu mu),
  "hashtagCount": sayı (hashtag sayısı),
  "prohibitedPhrases": ["bulunan yasaklı ifadeler"],
  "missingDetails": ["eksik önemli detaylar"],
  "status": "GÜVENLİ" veya "KONTROL GEREKİYOR",
  "notes": ["notlar listesi"]
}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON");

    return ValidationSchema.parse(JSON.parse(jsonMatch[0]));
  } catch {
    return {
      namesMatch: true,
      numbersMatch: true,
      locationsMatch: true,
      datesMatch: true,
      allegationsPreserved: true,
      hashtagCount: generated.hashtags.length,
      prohibitedPhrases: [],
      missingDetails: [],
      status: "KONTROL GEREKİYOR",
      notes: ["Otomatik doğrulama tamamlanamadı, manuel kontrol gerekiyor"],
    };
  }
}
