export type FounderDTO = {
  id: number;
  user_id: number;
  startup_id: number;
  created_at: string;
};

export type Founder = {
  id: number;
  userId: number;
  startupId: number;
  createdAt: Date;
};

export const mapFounder = (dto: FounderDTO): Founder => ({
  id: dto.id,
  userId: dto.user_id,
  startupId: dto.startup_id,
  createdAt: new Date(dto.created_at),
});
