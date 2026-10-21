//= Services
import todoServices from "./todo.services.js";
export const addNewTodo = async (req, res, _next) => {
    const newTodo = await todoServices.saveNewTodo(req.user, req.body);
    res.status(201).json({
        data: newTodo,
    });
};
export const getTodos = async (req, res, _next) => {
    const todosResponse = await todoServices.getUserTodos(req.user, req.validatedQuery);
    res.status(200).json({
        data: todosResponse,
    });
};
export const getTodosStats = async (req, res, _next) => {
    const stats = await todoServices.calculateTodosStats(req.user);
    res.status(200).json({
        data: stats,
    });
};
export const getTodosCategories = async (req, res, _next) => {
    const categories = await todoServices.getCategories(req.user);
    res.status(200).json({
        data: categories,
    });
};
export const editTodo = async (req, res, _next) => {
    const updatedTodo = await todoServices.handleEditTodo(req.user, req.params, req.body);
    res.status(201).json({
        data: updatedTodo,
    });
};
export const deleteTodo = async (req, res, _next) => {
    await todoServices.handleDeleteTodo(req.user, req.params);
    res.status(204).send();
};
export const deleteCompletedTodos = async (req, res, _next) => {
    const deletedCount = await todoServices.handleDeleteCompletedTodos(req.user);
    res.status(200).json({
        data: {
            deletedCount,
        },
    });
};
//# sourceMappingURL=todo.controller.js.map