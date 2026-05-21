import QRCode from "qrcode";
import { Jimp } from "jimp";

const LOGO_SIZE_RATIO = 0.22;

let _logoBuffer: Buffer | null = null;
let _logoError = false;

async function getLogoBuffer(): Promise<Buffer | null> {
  if (_logoBuffer) return _logoBuffer;
  if (_logoError) return null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/logo.webp`);
    if (!res.ok) throw new Error(`Logo fetch failed: ${res.status}`);
    _logoBuffer = Buffer.from(await res.arrayBuffer());
    return _logoBuffer;
  } catch (err) {
    console.error("Failed to load logo for QR:", err);
    _logoError = true;
    return null;
  }
}

export async function generateQRCode(
  userId: string | null,
  name: string
): Promise<Buffer> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const encodedName = encodeURIComponent(name);
  const params = new URLSearchParams({ name: encodedName });
  if (userId) params.set("userId", userId);
  const qrContent = `${baseUrl}/scan?${params.toString()}`;

  const qrBuffer = await QRCode.toBuffer(qrContent, {
    type: "png",
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });

  const logoBuffer = await getLogoBuffer();
  if (!logoBuffer) return qrBuffer;

  try {
    const [qrImage, logo] = await Promise.all([
      Jimp.read(qrBuffer),
      Jimp.read(logoBuffer),
    ]);

    const qrSize = qrImage.width;
    const logoSize = Math.round(qrSize * LOGO_SIZE_RATIO);
    logo.resize({ w: logoSize, h: logoSize });

    const x = Math.round((qrSize - logoSize) / 2);
    const y = Math.round((qrSize - logoSize) / 2);

    qrImage.composite(logo, x, y);

    return Buffer.from(await qrImage.getBuffer("image/png"));
  } catch (err) {
    console.error("Failed to composite logo onto QR:", err);
    return qrBuffer;
  }
}
