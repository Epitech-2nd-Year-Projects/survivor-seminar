export type PartnerDTO = {
  id: number;
  name: string;
  legal_status?: string | null;
  address?: string | null;
  email: string;
  phone?: string | null;
  created_at?: string | null;
  description?: string | null;
  partnership_type?: string | null;
};

export type Partner = {
  id: number;
  name: string;
  legalStatus?: string | null;
  address?: string | null;
  email: string;
  phone?: string | null;
  createdAt?: Date | null;
  description?: string | null;
  partnershipType?: string | null;
};

export const mapPartner = (dto: PartnerDTO): Partner => ({
  id: dto.id,
  name: dto.name,
  legalStatus: dto.legal_status,
  address: dto.address,
  email: dto.email,
  phone: dto.phone,
  createdAt: dto.created_at ? new Date(dto.created_at) : null,
  description: dto.description,
  partnershipType: dto.partnership_type,
});
