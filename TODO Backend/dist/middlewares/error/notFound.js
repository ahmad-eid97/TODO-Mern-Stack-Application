import { AppError } from "../../errors/AppError.js";
const notFound = (req, _res, next) => {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, "ROUTE_NOT_FOUND"));
};
export default notFound;
//# sourceMappingURL=notFound.js.map