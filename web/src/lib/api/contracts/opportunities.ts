export type OpportunityDTO = {
  id: number;
  title: string;
  type: string;
  organism: string;
  description?: string | null;
  criteria?: string | null;
  external_link?: string | null;
  deadline?: string | null;
  created_at: string;
  updated_at: string;
};

export type Opportunity = {
  id: number;
  title: string;
  type: string;
  organism: string;
  description?: string | null;
  criteria?: string | null;
  externalLink?: string | null;
  deadline?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const mapOpportunity = (dto: OpportunityDTO): Opportunity => ({
  id: dto.id,
  title: dto.title,
  type: dto.type,
  organism: dto.organism,
  description: dto.description,
  criteria: dto.criteria,
  externalLink: dto.external_link,
  deadline: dto.deadline,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});
