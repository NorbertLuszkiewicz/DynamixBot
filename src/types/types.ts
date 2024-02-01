import { InferSchemaType } from "mongoose";
import { UserSchema } from "../models/User";

export type User = InferSchemaType<typeof UserSchema>;
