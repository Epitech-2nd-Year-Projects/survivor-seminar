import { apiFetchClient } from "@/lib/api/http/client";
import type {
  ListResponseDTO,
  ItemResponseDTO,
} from "@/lib/api/contracts/common";
import { mapPaginatedNews, toNewsQuery, type ListNewsParams } from "./shared";
import { mapNews, type NewsDTO } from "../../contracts/news";

export type CreateNewsBody = {
  title: string;
  news_date?: string;
  location?: string;
  category?: string;
  startup_id?: number;
  description: string;
  image_url?: string;
};

export type UpdateNewsBody = Partial<CreateNewsBody>;

export async function listNewsClient(p?: ListNewsParams) {
  const res = await apiFetchClient<ListResponseDTO<NewsDTO>>(
    `/news${toNewsQuery(p)}`,
  );
  return mapPaginatedNews(res);
}

export async function getNewsClient(id: number) {
  const res = await apiFetchClient<ItemResponseDTO<NewsDTO>>(`/news/${id}`);
  return mapNews(res.data);
}

export async function createNewsClient(body: CreateNewsBody) {
  const res = await apiFetchClient<ItemResponseDTO<NewsDTO>>(`/admin/news`, {
    method: "POST",
    body,
  });
  return mapNews(res.data);
}

export async function updateNewsClient(id: number, body: UpdateNewsBody) {
  const res = await apiFetchClient<ItemResponseDTO<NewsDTO>>(
    `/admin/news/${id}`,
    { method: "PATCH", body },
  );
  return mapNews(res.data);
}

export async function deleteNewsClient(id: number) {
  await apiFetchClient<void>(`/admin/news/${id}`, { method: "DELETE" });
}
