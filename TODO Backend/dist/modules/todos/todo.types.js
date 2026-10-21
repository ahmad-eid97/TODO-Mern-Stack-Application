//= Types
import { Types } from "mongoose";
export var Priority;
(function (Priority) {
    Priority["low"] = "Low";
    Priority["medium"] = "Medium";
    Priority["high"] = "High";
    Priority["urgent"] = "Urgent";
})(Priority || (Priority = {}));
export var Status;
(function (Status) {
    Status["pending"] = "Pending";
    Status["inProgress"] = "In Progress";
    Status["completed"] = "Completed";
})(Status || (Status = {}));
//# sourceMappingURL=todo.types.js.map