import { Server } from "socket.io";
import { Task, Column, Board } from "../models";
import { logger } from "../middleware/errorHandler";
import { userPresence } from "./utils";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  AuthenticatedSocket,
  Task as TaskType,
} from "../types";

export const taskHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: AuthenticatedSocket
) => {
  // Create new task
  socket.on("task:create", async (taskData) => {
    try {
      // Verify user is in a board
      const userInfo = userPresence.get(socket.id);
      if (!userInfo?.boardId) {
        socket.emit("error", { message: "Not connected to any board" });
        return;
      }

      // Verify column exists and belongs to the current board
      const column = await Column.findById(taskData.columnId);
      if (!column || column.boardId !== userInfo.boardId) {
        socket.emit("error", { message: "Invalid column" });
        return;
      }

      // Verify user has access to the board
      const board = await Board.findById(userInfo.boardId);
      if (
        !board ||
        (!board.members.includes(socket.userId!) &&
          board.ownerId !== socket.userId!)
      ) {
        socket.emit("error", { message: "Access denied" });
        return;
      }

      // Create task
      const newTask = await Task.create({
        ...taskData,
        createdBy: socket.userId!,
      });

      const taskResponse: TaskType = {
        id: (newTask as any)._id.toString(),
        title: (newTask as any).title,
        description: (newTask as any).description,
        assigneeId: (newTask as any).assigneeId,
        columnId: (newTask as any).columnId,
        position: (newTask as any).position,
        priority: (newTask as any).priority,
        dueDate: (newTask as any).dueDate,
        createdAt: (newTask as any).createdAt,
        updatedAt: newTask.updatedAt,
        createdBy: newTask.createdBy,
      };

      // Notify all users in the board
      io.to(userInfo.boardId).emit("task:created", taskResponse);

      logger.info(
        `Task created by ${socket.username} in board ${userInfo.boardId}`
      );
    } catch (error) {
      logger.error("Error creating task:", error);
      socket.emit("error", { message: "Failed to create task" });
    }
  });

  // Update task
  socket.on("task:update", async (taskId: string, updates) => {
    try {
      // Verify user is in a board
      const userInfo = userPresence.get(socket.id);
      if (!userInfo?.boardId) {
        socket.emit("error", { message: "Not connected to any board" });
        return;
      }

      // Find task and verify it belongs to current board
      const task = await Task.findById(taskId);
      if (!task) {
        socket.emit("error", { message: "Task not found" });
        return;
      }

      const column = await Column.findById(task.columnId);
      if (!column || column.boardId !== userInfo.boardId) {
        socket.emit("error", { message: "Task not in current board" });
        return;
      }

      // Update task
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedTask) {
        socket.emit("error", { message: "Failed to update task" });
        return;
      }

      const taskResponse: TaskType = {
        id: (updatedTask as any)._id.toString(),
        title: (updatedTask as any).title,
        description: (updatedTask as any).description,
        assigneeId: (updatedTask as any).assigneeId,
        columnId: (updatedTask as any).columnId,
        position: (updatedTask as any).position,
        priority: (updatedTask as any).priority,
        dueDate: (updatedTask as any).dueDate,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt,
        createdBy: updatedTask.createdBy,
      };

      // Notify all users in the board
      io.to(userInfo.boardId).emit("task:updated", taskResponse);

      logger.info(`Task ${taskId} updated by ${socket.username}`);
    } catch (error) {
      logger.error("Error updating task:", error);
      socket.emit("error", { message: "Failed to update task" });
    }
  });

  // Delete task
  socket.on("task:delete", async (taskId: string) => {
    try {
      // Verify user is in a board
      const userInfo = userPresence.get(socket.id);
      if (!userInfo?.boardId) {
        socket.emit("error", { message: "Not connected to any board" });
        return;
      }

      // Find task and verify it belongs to current board
      const task = await Task.findById(taskId);
      if (!task) {
        socket.emit("error", { message: "Task not found" });
        return;
      }

      const column = await Column.findById(task.columnId);
      if (!column || column.boardId !== userInfo.boardId) {
        socket.emit("error", { message: "Task not in current board" });
        return;
      }

      // Check permissions (only creator or board owner can delete)
      const board = await Board.findById(userInfo.boardId);
      if (
        task.createdBy !== socket.userId! &&
        board?.ownerId !== socket.userId!
      ) {
        socket.emit("error", { message: "Permission denied" });
        return;
      }

      // Delete task
      await Task.findByIdAndDelete(taskId);

      // Update positions of remaining tasks in the column
      await Task.updateMany(
        { columnId: task.columnId, position: { $gt: task.position } },
        { $inc: { position: -1 } }
      );

      // Notify all users in the board
      io.to(userInfo.boardId).emit("task:deleted", taskId);

      logger.info(`Task ${taskId} deleted by ${socket.username}`);
    } catch (error) {
      logger.error("Error deleting task:", error);
      socket.emit("error", { message: "Failed to delete task" });
    }
  });

  // Move task (drag & drop)
  socket.on(
    "task:move",
    async (taskId: string, toColumnId: string, position: number) => {
      try {
        // Verify user is in a board
        const userInfo = userPresence.get(socket.id);
        if (!userInfo?.boardId) {
          socket.emit("error", { message: "Not connected to any board" });
          return;
        }

        // Find task
        const task = await Task.findById(taskId);
        if (!task) {
          socket.emit("error", { message: "Task not found" });
          return;
        }

        // Verify both columns belong to current board
        const [sourceColumn, targetColumn] = await Promise.all([
          Column.findById(task.columnId),
          Column.findById(toColumnId),
        ]);

        if (
          !sourceColumn ||
          !targetColumn ||
          sourceColumn.boardId !== userInfo.boardId ||
          targetColumn.boardId !== userInfo.boardId
        ) {
          socket.emit("error", {
            message: "Invalid column or not in current board",
          });
          return;
        }

        const fromColumnId = task.columnId;
        const oldPosition = task.position;

        // If moving within the same column
        if (fromColumnId === toColumnId) {
          if (position === oldPosition) {
            return; // No change needed
          }

          if (position < oldPosition) {
            // Moving up: increment positions of tasks between new and old position
            await Task.updateMany(
              {
                columnId: toColumnId,
                position: { $gte: position, $lt: oldPosition },
              },
              { $inc: { position: 1 } }
            );
          } else {
            // Moving down: decrement positions of tasks between old and new position
            await Task.updateMany(
              {
                columnId: toColumnId,
                position: { $gt: oldPosition, $lte: position },
              },
              { $inc: { position: -1 } }
            );
          }
        } else {
          // Moving to different column
          // Decrement positions in source column
          await Task.updateMany(
            { columnId: fromColumnId, position: { $gt: oldPosition } },
            { $inc: { position: -1 } }
          );

          // Increment positions in target column
          await Task.updateMany(
            { columnId: toColumnId, position: { $gte: position } },
            { $inc: { position: 1 } }
          );
        }

        // Update the task
        const updatedTask = await Task.findByIdAndUpdate(
          taskId,
          {
            columnId: toColumnId,
            position,
            updatedAt: new Date(),
          },
          { new: true }
        );

        if (!updatedTask) {
          socket.emit("error", { message: "Failed to move task" });
          return;
        }

        // Notify all users in the board
        io.to(userInfo.boardId).emit(
          "task:moved",
          taskId,
          fromColumnId,
          toColumnId,
          position
        );

        logger.info(
          `Task ${taskId} moved by ${socket.username} from column ${fromColumnId} to ${toColumnId}`
        );
      } catch (error) {
        logger.error("Error moving task:", error);
        socket.emit("error", { message: "Failed to move task" });
      }
    }
  );
};
