import { InferSchemaType } from "mongoose";
import { UserSchema } from "../models/User";

export type User = InferSchemaType<typeof UserSchema>;

type Image = {
  url: string;
  height: number;
  width: number;
};

export type UserProfile = {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: { spotify: string };
  followers: { href: string; total: number };
  href: string;
  id: string;
  images: Image[];
  product: string;
  type: string;
  uri: string;
};

export type PLayingSong = {
  isPlayingNow: boolean;
  title: string;
  link: string;
  userAdded: string;
};

export type BlockedSong = {
  user: string;
  title: string;
  reason: string;
};
