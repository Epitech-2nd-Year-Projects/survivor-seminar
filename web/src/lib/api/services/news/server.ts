import "server-only";
import { apiFetchServer } from "@/lib/api/http/server";
import type {
  ListResponseDTO,
  ItemResponseDTO,
} from "@/lib/api/contracts/common";
import { mapPaginatedNews, toNewsQuery, type ListNewsParams } from "./shared";
import { mapNews, type NewsDTO } from "../../contracts/news";

export async function listNewsServer(p?: ListNewsParams, revalidate = 60) {
  const res = await apiFetchServer<ListResponseDTO<NewsDTO>>(
    `/news${toNewsQuery(p)}`,
    { next: { revalidate, tags: ["events"] } },
  );
  return mapPaginatedNews(res);
}

export async function getInvestorServer(id: number, revalidate = 60) {
  const res = await apiFetchServer<ItemResponseDTO<NewsDTO>>(`/news/${id}`, {
    next: { revalidate, tags: [`event:${id}`] },
  });
  return mapNews(res.data);
}
