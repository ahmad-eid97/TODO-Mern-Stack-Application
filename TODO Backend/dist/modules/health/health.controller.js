import mongoose from "mongoose";
export const healthCheck = (_req, res) => {
    const databaseState = mongoose.connection.readyState;
    if (databaseState === 1) {
        return res.status(200).json({
            status: "Ok",
            database: "Connected",
        });
    }
    else {
        return res.status(503).json({
            status: "Service Unavailable",
            database: "Disconnected",
        });
    }
};
//# sourceMappingURL=health.controller.js.map