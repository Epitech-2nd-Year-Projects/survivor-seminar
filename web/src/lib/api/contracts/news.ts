export type NewsDTO = {
  id: number;
  title: string;
  news_data?: string | null;
  location?: string | null;
  category?: string | null;
  startup_id?: number | null;
  description: string;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type News = {
  id: number;
  title: string;
  newsData?: string | null;
  location?: string | null;
  category?: string | null;
  startupId?: number | null;
  description: string;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const mapNews = (dto: NewsDTO): News => ({
  id: dto.id,
  title: dto.title,
  newsData: dto.news_data,
  location: dto.location,
  category: dto.category,
  startupId: dto.startup_id,
  description: dto.description,
  imageUrl: dto.image_url,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});
