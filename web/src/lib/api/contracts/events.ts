export type EventDTO = {
  id: number;
  name: string;
  description?: string | null;
  event_type?: string | null;
  location?: string | null;
  target_audience?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  capacity?: number | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: number;
  name: string;
  description?: string | null;
  eventType?: string | null;
  location?: string | null;
  targetAudience?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  capacity?: number | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const mapEvent = (dto: EventDTO): Event => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  eventType: dto.event_type,
  location: dto.location,
  targetAudience: dto.target_audience,
  startDate: dto.start_date ? new Date(dto.start_date) : null,
  endDate: dto.end_date ? new Date(dto.end_date) : null,
  capacity: dto.capacity,
  imageUrl: dto.image_url,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});
