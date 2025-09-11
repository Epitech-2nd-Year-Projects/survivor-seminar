export type UserDTO = {
  id: number;
  email: string;
  name: string;
  role: string;
  founder_id?: number | null;
  investor_id?: number | null;
  startup_id?: number | null;
  image_url?: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  founderId?: number | null;
  investorId?: number | null;
  startupId?: number | null;
  imageUrl?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const mapUser = (dto: UserDTO): User => ({
  id: dto.id,
  email: dto.email,
  name: dto.name,
  role: dto.role,
  founderId: dto.founder_id,
  investorId: dto.investor_id,
  imageUrl: dto.image_url,
  emailVerified: dto.email_verified,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});
