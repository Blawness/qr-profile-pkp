import QRCode from "qrcode";

export async function generateQRCode(
  userId: string | null,
  name: string
): Promise<Buffer> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const encodedName = encodeURIComponent(name);
  const params = new URLSearchParams({ name: encodedName });
  if (userId) params.set("userId", userId);
  const qrContent = `${baseUrl}/scan?${params.toString()}`;

  const buffer = await QRCode.toBuffer(qrContent, {
    type: "png",
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  return buffer;
}
