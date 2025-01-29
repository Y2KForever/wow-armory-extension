type JWT = {
  exp: number;
  opaque_user_id: string;
  user_id: string;
  channel_id: string;
  role: string;
  is_unlinked: boolean;
  pubsub_perms: {
    listen: string[];
    send: string[];
  };
};

export type { JWT };
