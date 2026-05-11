export type Member = {
  id: number;
  userId: string;
  name: string;
  email: string | null;
  photoUrl: string | null;
  qrCodeUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};
