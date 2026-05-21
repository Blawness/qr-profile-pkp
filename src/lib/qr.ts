import QRCode from "qrcode";
import { Jimp } from "jimp";
import { resolve } from "path";

const LOGO_SIZE_RATIO = 0.22; // logo takes 22% of QR width

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

  try {
    const logoPath = resolve(process.cwd(), "public", "logo.webp");
    const [qrImage, logo] = await Promise.all([
      Jimp.read(qrBuffer),
      Jimp.read(logoPath),
    ]);

    const qrSize = qrImage.width;
    const logoSize = Math.round(qrSize * LOGO_SIZE_RATIO);
    logo.resize({ w: logoSize, h: logoSize });

    const x = Math.round((qrSize - logoSize) / 2);
    const y = Math.round((qrSize - logoSize) / 2);

    qrImage.composite(logo, x, y);

    return Buffer.from(await qrImage.getBuffer("image/png"));
  } catch {
    // Logo not found or processing failed — return QR without logo
    return qrBuffer;
  }
}
