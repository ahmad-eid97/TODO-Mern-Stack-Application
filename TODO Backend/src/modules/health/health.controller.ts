//= Modules
import type { Request, Response } from "express";
import mongoose from "mongoose";

export const healthCheck = (_req: Request, res: Response) => {
  const databaseState = mongoose.connection.readyState;

  if (databaseState === 1) {
    return res.status(200).json({
      status: "Ok",
      database: "Connected",
    });
  } else {
    return res.status(503).json({
      status: "Service Unavailable",
      database: "Disconnected",
    });
  }
};
