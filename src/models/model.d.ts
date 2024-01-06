import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  coverImage: string;
  password: string;
  watchHistory: mongoose.Schema.Types.ObjectId[];
  refreshToken: string;
  isCorrectPassword(password: string): Promise<boolean>;
  getAccessToken(): string;
  getRefreshToken(): string;
}

export interface IVideos extends Document {
  videoFile: string;
  thumbnail: string;
  owner: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  duration: number;
  views: number;
  isPublished: boolean;
}

export interface IPlaylists extends Document {
  name: string;
  description: string;
  videos: mongoose.Schema.Types.ObjectId[];
  owner: mongoose.Schema.Types.ObjectId;
}

export interface IComments extends Document {
  content: string;
  video: mongoose.Schema.Types.ObjectId;
  owner: mongoose.Schema.Types.ObjectId;
}

export interface ITweets extends Document {
  owner: mongoose.Schema.Types.ObjectId;
  content: string;
}

export interface ISubscriptions extends Document {
  subscriber: mongoose.Schema.Types.ObjectId;
  channel: mongoose.Schema.Types.ObjectId;
}

export interface ILikes extends Document {
  comment: mongoose.Schema.Types.ObjectId;
  video: mongoose.Schema.Types.ObjectId;
  tweet: mongoose.Schema.Types.ObjectId;
  likedBy: mongoose.Schema.Types.ObjectId;
}
