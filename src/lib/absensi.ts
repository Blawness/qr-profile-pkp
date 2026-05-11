const ABSENSI_BASE = process.env.ABSENSI_BASE_URL || "http://localhost:3004";
const API_KEY = process.env.ABSENSI_API_KEY || "";

export interface AutoCheckInResponse {
  success: boolean;
  message: string;
}

export async function autoCheckIn(
  userId: string,
  latitude: number,
  longitude: number,
  accuracy: number
): Promise<AutoCheckInResponse> {
  const res = await fetch(
    `${ABSENSI_BASE}/api/external/attendance/auto-checkin`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ userId, latitude, longitude, accuracy }),
    }
  );

  return res.json();
}
