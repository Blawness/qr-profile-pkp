export type Member = {
  id: number;
  userId: string | null;
  name: string;
  email: string | null;
  divisi: string | null;
  jabatan: string | null;
  noTelp: string | null;
  photoUrl: string | null;
  qrCodeUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};
