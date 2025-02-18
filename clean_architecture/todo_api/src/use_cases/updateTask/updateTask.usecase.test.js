const assert = require("node:assert");
const { describe, it, mock } = require("node:test");
const UpdateTaskUseCase = require("./updateTask.usecase");
const TaskEntity = require("../../entities/taskEntity");
const TaskDTO = require("../interfaces/task.dto");
const UseCaseError = require("../useCase.error");
const TaskPOJO = require("../../entities/taskPOJO");
const TaskEntityError = require("../../entities/taskEntity.error");

describe("Testing UpdateTaskUseCase", () => {
  it("should throw an error is taskPOJO is in an invalid state", async () => {
    const task = new TaskPOJO("", "fasd", "asdf");
    const mockDatabase = {};
    const updateTaskUseCase = new UpdateTaskUseCase(mockDatabase);
    try {
      await updateTaskUseCase.execute(1, task);
      throw new Error("should have failed");
    } catch (e) {
      assert.strictEqual(e instanceof TaskEntityError, true);
      assert.strictEqual(e.message, "'name' is a required field");
    }
  });
  it("shouldn't be possible to update the task name to an existing name", async () => {
    const mockDatabase = {};
    const existingTask = new TaskEntity("task");
    existingTask.setID(2);
    mockDatabase.getTaskByName = mock.fn(async (_) => existingTask);
    mockDatabase.getTaskByDueDate = mock.fn(async (_) => null);
    mockDatabase.updateTask = mock.fn(async (_, __) => null);

    const updateTaskUseCase = new UpdateTaskUseCase(mockDatabase);
    const pojo = new TaskPOJO("task");
    try {
      await updateTaskUseCase.execute(1, pojo);
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
    const pojo = new TaskPOJO("task 1", false, duplicatedTaskDueDate);
    try {
      await updateTaskUseCase.execute(1, pojo);
      throw new Error("should have failed with UseCaseError");
    } catch (e) {
      assert.strictEqual(e instanceof UseCaseError, true);
      assert.strictEqual(
        e.message,
        `Due date ${new Date(pojo.dueDate).toLocaleString()} already exists.`,
      );
    }
  });

  it("should return null if provided id doesn't exist", async () => {
    const mockDatabase = {};
    mockDatabase.getTaskByName = mock.fn(async (_) => null);
    mockDatabase.getTaskByDueDate = mock.fn(async (_) => null);
    mockDatabase.updateTask = mock.fn(async (_, __) => null);
    const updateTaskUseCase = new UpdateTaskUseCase(mockDatabase);
    const pojo = new TaskPOJO("task");
    const updatedTask = await updateTaskUseCase.execute(
      Number.MAX_SAFE_INTEGER,
      pojo,
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
    const newPojo = new TaskPOJO("task 3");
    const updatedTask = await updateTaskUseCase.execute(1, newPojo);
    assert.deepStrictEqual(TaskDTO.fromEntity(entity), updatedTask);
  });
});
