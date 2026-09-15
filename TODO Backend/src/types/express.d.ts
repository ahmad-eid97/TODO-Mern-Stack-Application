import type { IUser } from "../modules/auth/auth.types.ts";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};
