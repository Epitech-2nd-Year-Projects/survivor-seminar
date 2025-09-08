export type InvestorDTO = {
  id: number;
  name: string;
  legal_status?: string | null;
  address?: string | null;
  email: string;
  phone?: string | null;
  created_at?: string | null;
  description?: string | null;
  investor_type?: string | null;
  investment_focus?: string | null;
};

export type Investor = {
  id: number;
  name: string;
  legalStatus?: string | null;
  address?: string | null;
  email: string;
  phone?: string | null;
  createdAt?: Date | null;
  description?: string | null;
  investorType?: string | null;
  investmentFocus?: string | null;
};

export const mapInvestor = (dto: InvestorDTO): Investor => ({
  id: dto.id,
  name: dto.name,
  legalStatus: dto.legal_status,
  address: dto.address,
  email: dto.email,
  phone: dto.phone,
  createdAt: dto.created_at ? new Date(dto.created_at) : null,
  description: dto.description,
  investorType: dto.investor_type,
  investmentFocus: dto.investment_focus,
});
