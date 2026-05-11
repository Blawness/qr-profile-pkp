export type Member = {
  id: number;
  userId: string | null;
  name: string;
  email: string | null;
  photoUrl: string | null;
  qrCodeUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};
