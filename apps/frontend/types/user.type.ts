export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  telegramChatId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
