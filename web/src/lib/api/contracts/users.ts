export type UserDTO = {
  id: number;
  email: string;
  name: string;
  role: string;
  founder_id?: number | null;
  investor_id?: number | null;
  image_url?: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
};

export enum UserRole {
  Admin = "admin",
  Founder = "founder",
  Investor = "investor",
}

export type User = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  founderId?: number | null;
  investorId?: number | null;
  imageUrl?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const mapUserRole = (role: string): UserRole => {
  switch (role) {
    case "admin":
      return UserRole.Admin;
    case "founder":
      return UserRole.Founder;
    case "investor":
      return UserRole.Investor;
    default:
      throw new Error(`Invalid user role: ${role}`);
  }
};

export const mapUserRoleLabel = (role: UserRole): string => {
  switch (role) {
    case UserRole.Admin:
      return "Admin";
    case UserRole.Founder:
      return "Founder";
    case UserRole.Investor:
      return "Investor";
    default:
      return "User";
  }
};

export const mapUser = (dto: UserDTO): User => ({
  id: dto.id,
  email: dto.email,
  name: dto.name,
  role: mapUserRole(dto.role),
  founderId: dto.founder_id,
  investorId: dto.investor_id,
  imageUrl: dto.image_url,
  emailVerified: dto.email_verified,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});
