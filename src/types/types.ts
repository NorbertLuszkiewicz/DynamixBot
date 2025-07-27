import { InferSchemaType } from "mongoose";
import { CommandSchema } from "../models/Command";
import { CredentialsSchema } from "../models/Credentials";
import { RiotSchema } from "../models/Riot";
import { SongSchema } from "../models/Song";
import { OnMessageExtra, OnMessageFlags } from "comfy.js";

export type Command = InferSchemaType<typeof CommandSchema>;
export type Credentials = InferSchemaType<typeof CredentialsSchema>;
export type Riot = InferSchemaType<typeof RiotSchema>;
export type Song = InferSchemaType<typeof SongSchema>;

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

export interface ChatMessage {
  user: string;
  message: string;
  flags: Partial<OnMessageFlags>; // customReward, mod, broadcaster
  extra: Partial<OnMessageExtra>; // channel, customRewardId
  isKick?: boolean;
  kickAccessToken?: string | null;
}

export interface ChatCommand {
  user: string;
  command: string;
  message: string;
  flags: Partial<OnMessageFlags>; // customReward, mod, broadcaster
  extra: Partial<OnMessageExtra>; // channel, customRewardId
  isKick?: boolean;
  kickAccessToken?: string | null;
}
export interface ChatEvent {
  user: string;
  message: string;
  flags: Partial<OnMessageFlags>; // customReward, mod, broadcaster
  extra: Partial<OnMessageExtra>; // channel, customRewardId
}
export interface KickBadge {
  text: string;
  type: string;
  count?: number;
}

export interface KickIdentity {
  username_color: string;
  badges: KickBadge[];
}

export interface KickUser {
  is_anonymous: boolean;
  user_id: number;
  username: string;
  is_verified: boolean;
  profile_picture: string;
  channel_slug: string;
  identity: KickIdentity | null;
}

export interface KickEmotePosition {
  s: number;
  e: number;
}

export interface KickEmote {
  emote_id: string;
  positions: KickEmotePosition[];
}

export interface KickMessageData {
  message_id: string;
  broadcaster: KickUser;
  sender: KickUser;
  content: string;
  emotes: KickEmote[];
  created_at: string;
}
