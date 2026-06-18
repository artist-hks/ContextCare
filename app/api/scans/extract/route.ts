import { NextRequest, NextResponse } from "next/server";
import { runOcr } from "@/lib/ocr";
import { parseMetricsFromText } from "@/lib/metrics";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many uploads. Try again in ${limit.retryAfter}s.` },
      { status: 429 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Could not read the upload. Please try selecting the image again." },
      { status: 400 }
    );
  }

  const file = form.get("image");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No image found. Please choose a photo of your lab report." },
      { status: 400 }
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "That file is not an image. Please upload a photo of your report." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image is larger than 8MB. Please use a smaller or compressed photo." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await runOcr(buffer);
    const metrics = parseMetricsFromText(rawText);

    if (metrics.length === 0) {
      return NextResponse.json(
        {
          rawText,
          metrics: [],
          warning:
            "We couldn't read any known lab values. You can add them manually on the next screen.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ rawText, metrics }, { status: 200 });
  } catch (err) {
    console.error("OCR extract failed:", err);
    return NextResponse.json(
      { error: "We couldn't process that image. Please retake the photo and try again." },
      { status: 500 }
    );
  }
}
