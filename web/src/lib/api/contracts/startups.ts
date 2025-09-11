export type StartupDTO = {
  id: number;
  name: string;
  legal_status?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at: string;
  description?: string | null;
  website_url?: string | null;
  social_media_url?: string | null;
  project_status?: string | null;
  needs?: string | null;
  sector?: string | null;
  maturity?: string | null;
  views_count: number;
};

export type Startup = {
  id: number;
  name: string;
  legalStatus?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt: Date;
  description?: string | null;
  websiteUrl?: string | null;
  socialMediaUrl?: string | null;
  projectStatus?: string | null;
  needs?: string | null;
  sector?: string | null;
  maturity?: string | null;
  viewsCount: number;
};

export const mapStartup = (dto: StartupDTO): Startup => ({
  id: dto.id,
  name: dto.name,
  legalStatus: dto.legal_status,
  address: dto.address,
  email: dto.email,
  phone: dto.phone,
  createdAt: new Date(dto.created_at),
  description: dto.description,
  websiteUrl: dto.website_url,
  socialMediaUrl: dto.social_media_url,
  projectStatus: dto.project_status,
  needs: dto.needs,
  sector: dto.sector,
  maturity: dto.maturity,
  viewsCount: dto.views_count,
});
