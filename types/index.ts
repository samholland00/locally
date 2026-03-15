export type User = {
  id: string;
  display_name: string;
  street_name: string;
  geohash: string;
  photo_url: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  user: Pick<User, 'display_name' | 'street_name' | 'photo_url'>;
  content: string;
  geohash: string;
  created_at: string;
  reply_count: number;
};

export type Reply = {
  id: string;
  post_id: string;
  user_id: string;
  user: Pick<User, 'display_name' | 'street_name' | 'photo_url'>;
  content: string;
  created_at: string;
};

export type InviteToken = {
  id: string;
  created_by: string;
  geohash: string;
  expires_at: string;
  used: boolean;
  created_at: string;
};
