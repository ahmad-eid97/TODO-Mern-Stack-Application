export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  tokenVersion: number;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Pick<
  IUser,
  "_id" | "name" | "email" | "avatar" | "createdAt" | "updatedAt"
>;
