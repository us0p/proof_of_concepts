const assert = require("node:assert");
const { describe, it, mock } = require("node:test");
const UpdateTaskUseCase = require("./updateTask.usecase");
const TaskEntity = require("../../entities/taskEntity");
const TaskDTO = require("../interfaces/task.dto");
const UseCaseError = require("../useCase.error");

describe("Testing UpdateTaskUseCase", () => {
  it("shouldn't be possible to update the task name to an existing name", async () => {
    const mockDatabase = {};
    const existingTask = new TaskEntity("task");
    existingTask.setID(2);
    mockDatabase.getTaskByName = mock.fn(async (_) => existingTask);
    mockDatabase.getTaskByDueDate = mock.fn(async (_) => null);
    mockDatabase.updateTask = mock.fn(async (_, __) => null);

    const updateTaskUseCase = new UpdateTaskUseCase(mockDatabase);
    const entity = new TaskEntity("task");
    try {
      await updateTaskUseCase.execute(1, TaskDTO.fromEntity(entity));
      throw new Error("should have failed with UseCaseError");
    } catch (e) {
      assert.strictEqual(e instanceof UseCaseError, true);
      assert.strictEqual(e.message, "Task with name 'task' already existis");
    }
  });

  it("shouldn't be possible to update the task to an existing date", async () => {
    const mockDatabase = {};
    const duplicatedTaskDueDate = new Date().toISOString();
    const existingTask = new TaskEntity("task", false, duplicatedTaskDueDate);
    existingTask.setID(2);
    mockDatabase.getTaskByName = mock.fn(async (_) => null);
    mockDatabase.getTaskByDueDate = mock.fn(async (_) => existingTask);
    mockDatabase.updateTask = mock.fn(async (_, __) => null);

    const updateTaskUseCase = new UpdateTaskUseCase(mockDatabase);
    const entity = new TaskEntity("task 1", false, duplicatedTaskDueDate);
    try {
      await updateTaskUseCase.execute(1, TaskDTO.fromEntity(entity));
      throw new Error("should have failed with UseCaseError");
    } catch (e) {
      assert.strictEqual(e instanceof UseCaseError, true);
      assert.strictEqual(
        e.message,
        `Due date ${new Date(entity.dueDate).toLocaleString()} already exists.`,
      );
    }
  });

  it("should return null if provided id doesn't exist", async () => {
    const mockDatabase = {};
    mockDatabase.getTaskByName = mock.fn(async (_) => null);
    mockDatabase.getTaskByDueDate = mock.fn(async (_) => null);
    mockDatabase.updateTask = mock.fn(async (_, __) => null);
    const updateTaskUseCase = new UpdateTaskUseCase(mockDatabase);
    const entity = new TaskEntity("task");
    const updatedTask = await updateTaskUseCase.execute(
      Number.MAX_SAFE_INTEGER,
      TaskDTO.fromEntity(entity),
    );
    assert.strictEqual(updatedTask, null);
  });

  it("should return the updated task", async () => {
    const mockDatabase = {};
    const entity = new TaskEntity("task 3");
    entity.setID(1);
    mockDatabase.getTaskByName = mock.fn(async (_) => null);
    mockDatabase.getTaskByDueDate = mock.fn(async (_) => null);
    mockDatabase.updateTask = mock.fn(async (_, __) => entity);

    const updateTaskUseCase = new UpdateTaskUseCase(mockDatabase);
    const newEntity = new TaskEntity("task 3");
    const updatedTask = await updateTaskUseCase.execute(
      1,
      TaskDTO.fromEntity(newEntity),
    );
    assert.deepStrictEqual(TaskDTO.fromEntity(entity), updatedTask);
  });
});
