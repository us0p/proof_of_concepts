const assert = require("node:assert");
const { describe, it, mock } = require("node:test");

const CreateTaskUseCase = require("./createTask.usecase");
const TaskDTO = require("../interfaces/task.dto");
const TaskEntity = require("../../entities/taskEntity");
const UseCaseError = require("../useCase.error");
const TaskPOJO = require("../../entities/taskPOJO");
const TaskEntityError = require("../../entities/taskEntity.error");

describe("Testing CreateTaskUseCase", () => {
  it("should throw an error if taskPOJO is in an invalid state", async () => {
    const taskPOJO = new TaskPOJO("", "asdf", "fdsa");
    const mockInMemoryDB = {};
    const createTaskUseCase = new CreateTaskUseCase(mockInMemoryDB);
    try {
      await createTaskUseCase.execute(taskPOJO);
      throw new Error("should have failed");
    } catch (e) {
      assert.strictEqual(e.message, "'name' is a required field");
      assert.strictEqual(e instanceof TaskEntityError, true);
    }
  });
  it("should throw an error if task name is duplicated", async () => {
    const existingTask = new TaskEntity("task");
    existingTask.setID(1);

    const mockInMemoryDB = {};
    mockInMemoryDB.getTaskByName = mock.fn(async (_) => existingTask);

    const createTaskUseCase = new CreateTaskUseCase(mockInMemoryDB);
    try {
      const duplicatedTask = new TaskPOJO("task");
      await createTaskUseCase.execute(duplicatedTask);
      throw Error("Should have failed with duplicated task name 'task'");
    } catch (e) {
      assert.strictEqual(e instanceof UseCaseError, true);
      assert.strictEqual(e.message === "Duplicated task name 'task'", true);
    }
  });

  it("should throw an error if task dueDate is duplicated", async () => {
    const duplicatedDueDate = new Date().toISOString();
    const existingTask = new TaskEntity("task", false, duplicatedDueDate);
    existingTask.setID(1);

    const mockInMemoryDB = {};
    mockInMemoryDB.getTaskByName = mock.fn(async (_) => null);
    mockInMemoryDB.getTaskByDueDate = mock.fn(async (_) => existingTask);

    const createTaskUsecase = new CreateTaskUseCase(mockInMemoryDB);
    try {
      const duplicatedDueDateTask = new TaskPOJO(
        "another task",
        false,
        duplicatedDueDate,
      );
      await createTaskUsecase.execute(duplicatedDueDateTask);
      throw Error("Should have failed with duplicated due date");
    } catch (e) {
      assert.strictEqual(e instanceof UseCaseError, true);
      assert.strictEqual(
        e.message,
        "Cannot schedule two tasks for the same time",
      );
    }
  });

  it("should return a TaskEntity with ID set", async () => {
    const newTask = new TaskEntity("task");
    newTask.setID(1);

    const mockInMemoryDB = {};
    mockInMemoryDB.getTaskByName = mock.fn(async (_) => null);
    mockInMemoryDB.getTaskByDueDate = mock.fn(async (_) => null);
    mockInMemoryDB.createTask = mock.fn(async (_) => newTask);

    const createTaskUseCase = new CreateTaskUseCase(mockInMemoryDB);

    const task = new TaskPOJO("task");
    const taskDTO = await createTaskUseCase.execute(task);
    assert.deepStrictEqual(taskDTO, TaskDTO.fromEntity(newTask));
  });
});
