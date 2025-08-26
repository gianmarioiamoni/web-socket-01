"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskHandlers = void 0;
const models_1 = require("@/models");
const errorHandler_1 = require("@/middleware/errorHandler");
const utils_1 = require("./utils");
const taskHandlers = (io, socket) => {
    socket.on("task:create", async (taskData) => {
        try {
            const userInfo = utils_1.userPresence.get(socket.id);
            if (!userInfo?.boardId) {
                socket.emit("error", { message: "Not connected to any board" });
                return;
            }
            const column = await models_1.Column.findById(taskData.columnId);
            if (!column || column.boardId !== userInfo.boardId) {
                socket.emit("error", { message: "Invalid column" });
                return;
            }
            const board = await models_1.Board.findById(userInfo.boardId);
            if (!board ||
                (!board.members.includes(socket.userId) &&
                    board.ownerId !== socket.userId)) {
                socket.emit("error", { message: "Access denied" });
                return;
            }
            const newTask = await models_1.Task.create({
                ...taskData,
                createdBy: socket.userId,
            });
            const taskResponse = {
                id: newTask._id.toString(),
                title: newTask.title,
                description: newTask.description,
                assigneeId: newTask.assigneeId,
                columnId: newTask.columnId,
                position: newTask.position,
                priority: newTask.priority,
                dueDate: newTask.dueDate,
                createdAt: newTask.createdAt,
                updatedAt: newTask.updatedAt,
                createdBy: newTask.createdBy,
            };
            io.to(userInfo.boardId).emit("task:created", taskResponse);
            errorHandler_1.logger.info(`Task created by ${socket.username} in board ${userInfo.boardId}`);
        }
        catch (error) {
            errorHandler_1.logger.error("Error creating task:", error);
            socket.emit("error", { message: "Failed to create task" });
        }
    });
    socket.on("task:update", async (taskId, updates) => {
        try {
            const userInfo = utils_1.userPresence.get(socket.id);
            if (!userInfo?.boardId) {
                socket.emit("error", { message: "Not connected to any board" });
                return;
            }
            const task = await models_1.Task.findById(taskId);
            if (!task) {
                socket.emit("error", { message: "Task not found" });
                return;
            }
            const column = await models_1.Column.findById(task.columnId);
            if (!column || column.boardId !== userInfo.boardId) {
                socket.emit("error", { message: "Task not in current board" });
                return;
            }
            const updatedTask = await models_1.Task.findByIdAndUpdate(taskId, { ...updates, updatedAt: new Date() }, { new: true });
            if (!updatedTask) {
                socket.emit("error", { message: "Failed to update task" });
                return;
            }
            const taskResponse = {
                id: updatedTask._id.toString(),
                title: updatedTask.title,
                description: updatedTask.description,
                assigneeId: updatedTask.assigneeId,
                columnId: updatedTask.columnId,
                position: updatedTask.position,
                priority: updatedTask.priority,
                dueDate: updatedTask.dueDate,
                createdAt: updatedTask.createdAt,
                updatedAt: updatedTask.updatedAt,
                createdBy: updatedTask.createdBy,
            };
            io.to(userInfo.boardId).emit("task:updated", taskResponse);
            errorHandler_1.logger.info(`Task ${taskId} updated by ${socket.username}`);
        }
        catch (error) {
            errorHandler_1.logger.error("Error updating task:", error);
            socket.emit("error", { message: "Failed to update task" });
        }
    });
    socket.on("task:delete", async (taskId) => {
        try {
            const userInfo = utils_1.userPresence.get(socket.id);
            if (!userInfo?.boardId) {
                socket.emit("error", { message: "Not connected to any board" });
                return;
            }
            const task = await models_1.Task.findById(taskId);
            if (!task) {
                socket.emit("error", { message: "Task not found" });
                return;
            }
            const column = await models_1.Column.findById(task.columnId);
            if (!column || column.boardId !== userInfo.boardId) {
                socket.emit("error", { message: "Task not in current board" });
                return;
            }
            const board = await models_1.Board.findById(userInfo.boardId);
            if (task.createdBy !== socket.userId &&
                board?.ownerId !== socket.userId) {
                socket.emit("error", { message: "Permission denied" });
                return;
            }
            await models_1.Task.findByIdAndDelete(taskId);
            await models_1.Task.updateMany({ columnId: task.columnId, position: { $gt: task.position } }, { $inc: { position: -1 } });
            io.to(userInfo.boardId).emit("task:deleted", taskId);
            errorHandler_1.logger.info(`Task ${taskId} deleted by ${socket.username}`);
        }
        catch (error) {
            errorHandler_1.logger.error("Error deleting task:", error);
            socket.emit("error", { message: "Failed to delete task" });
        }
    });
    socket.on("task:move", async (taskId, toColumnId, position) => {
        try {
            const userInfo = utils_1.userPresence.get(socket.id);
            if (!userInfo?.boardId) {
                socket.emit("error", { message: "Not connected to any board" });
                return;
            }
            const task = await models_1.Task.findById(taskId);
            if (!task) {
                socket.emit("error", { message: "Task not found" });
                return;
            }
            const [sourceColumn, targetColumn] = await Promise.all([
                models_1.Column.findById(task.columnId),
                models_1.Column.findById(toColumnId),
            ]);
            if (!sourceColumn ||
                !targetColumn ||
                sourceColumn.boardId !== userInfo.boardId ||
                targetColumn.boardId !== userInfo.boardId) {
                socket.emit("error", {
                    message: "Invalid column or not in current board",
                });
                return;
            }
            const fromColumnId = task.columnId;
            const oldPosition = task.position;
            if (fromColumnId === toColumnId) {
                if (position === oldPosition) {
                    return;
                }
                if (position < oldPosition) {
                    await models_1.Task.updateMany({
                        columnId: toColumnId,
                        position: { $gte: position, $lt: oldPosition },
                    }, { $inc: { position: 1 } });
                }
                else {
                    await models_1.Task.updateMany({
                        columnId: toColumnId,
                        position: { $gt: oldPosition, $lte: position },
                    }, { $inc: { position: -1 } });
                }
            }
            else {
                await models_1.Task.updateMany({ columnId: fromColumnId, position: { $gt: oldPosition } }, { $inc: { position: -1 } });
                await models_1.Task.updateMany({ columnId: toColumnId, position: { $gte: position } }, { $inc: { position: 1 } });
            }
            const updatedTask = await models_1.Task.findByIdAndUpdate(taskId, {
                columnId: toColumnId,
                position,
                updatedAt: new Date(),
            }, { new: true });
            if (!updatedTask) {
                socket.emit("error", { message: "Failed to move task" });
                return;
            }
            io.to(userInfo.boardId).emit("task:moved", taskId, fromColumnId, toColumnId, position);
            errorHandler_1.logger.info(`Task ${taskId} moved by ${socket.username} from column ${fromColumnId} to ${toColumnId}`);
        }
        catch (error) {
            errorHandler_1.logger.error("Error moving task:", error);
            socket.emit("error", { message: "Failed to move task" });
        }
    });
};
exports.taskHandlers = taskHandlers;
//# sourceMappingURL=taskHandlers.js.map