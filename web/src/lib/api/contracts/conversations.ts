import { mapUser, type User, type UserDTO } from "@/lib/api/contracts/users";

export type MessageDTO = {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  deleted_at?: string | null;
  sender?: UserDTO | null;
};

export type Message = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: Date;
  deletedAt?: Date | null;
  sender?: User | null;
};

export const mapMessage = (dto: MessageDTO): Message => ({
  id: dto.id,
  conversationId: dto.conversation_id,
  senderId: dto.sender_id,
  content: dto.content,
  createdAt: new Date(dto.created_at),
  deletedAt: dto.deleted_at ? new Date(dto.deleted_at) : null,
  sender: dto.sender ? mapUser(dto.sender) : null,
});

export type ConversationParticipantDTO = {
  id: number;
  conversation_id: number;
  user_id: number;
  role: "member" | "owner";
  last_read_message_id?: number | null;
  joined_at: string;
  user?: UserDTO | null;
};

export type ConversationParticipant = {
  id: number;
  conversationId: number;
  userId: number;
  role: "member" | "owner";
  lastReadMessageId?: number | null;
  joinedAt: Date;
  user?: User | null;
};

export const mapConversationParticipant = (
  dto: ConversationParticipantDTO,
): ConversationParticipant => ({
  id: dto.id,
  conversationId: dto.conversation_id,
  userId: dto.user_id,
  role: dto.role,
  lastReadMessageId: dto.last_read_message_id ?? null,
  joinedAt: new Date(dto.joined_at),
  user: dto.user ? mapUser(dto.user) : null,
});

export type ConversationDTO = {
  id: number;
  title?: string | null;
  is_group: boolean;
  last_message_id?: number | null;
  created_at: string;
  updated_at: string;
  participants?: ConversationParticipantDTO[];
  messages?: MessageDTO[];
  last_message?: MessageDTO | null;
};

export type Conversation = {
  id: number;
  title?: string | null;
  isGroup: boolean;
  lastMessageId?: number | null;
  createdAt: Date;
  updatedAt: Date;
  participants?: ConversationParticipant[];
  messages?: Message[];
  lastMessage?: Message | null;
};

export const mapConversation = (dto: ConversationDTO): Conversation => ({
  id: dto.id,
  title: dto.title ?? null,
  isGroup: dto.is_group,
  lastMessageId: dto.last_message_id ?? null,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
  participants: dto.participants
    ? dto.participants.map(mapConversationParticipant)
    : undefined,
  messages: dto.messages ? dto.messages.map(mapMessage) : undefined,
  lastMessage: dto.last_message ? mapMessage(dto.last_message) : null,
});

export type ConversationWithUnreadItemDTO = {
  data: ConversationDTO;
  unread_count: number;
};

export type ConversationWithUnread = {
  data: Conversation;
  unreadCount: number;
};

export const mapConversationWithUnreadItem = (
  dto: ConversationWithUnreadItemDTO,
): ConversationWithUnread => ({
  data: mapConversation(dto.data),
  unreadCount: dto.unread_count,
});

export const mapConversationItem = (dto: ConversationDTO): Conversation =>
  mapConversation(dto);
