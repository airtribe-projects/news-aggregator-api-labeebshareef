import mongoose, { Document, Schema } from "mongoose";

export interface IUserPreference extends Document {
  userId: mongoose.Types.ObjectId;
  topics: string[];
  language: string;
  country: string;
  sources?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userPreferenceSchema = new Schema<IUserPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    topics: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      default: "en",
    },
    country: {
      type: String,
      default: "us",
    },
    sources: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const UserPreference = mongoose.model<IUserPreference>(
  "UserPreference",
  userPreferenceSchema
);
