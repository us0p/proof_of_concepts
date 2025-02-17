const assert = require("node:assert");
const { describe, it, mock } = require("node:test");

const CreateTaskUseCase = require("./createTask.usecase");
const TaskDTO = require("../interfaces/task.dto");
const TaskEntity = require("../../entities/taskEntity");
const UseCaseError = require("../useCase.error");

describe("Testing CreateTaskUseCase", () => {
  it("should throw an error if task name is duplicated", async () => {
    const existingTask = new TaskEntity("task");
    existingTask.setID(1);

    const mockInMemoryDB = {};
    mockInMemoryDB.getTaskByName = mock.fn(async (_) => existingTask);

    const createTaskUseCase = new CreateTaskUseCase(mockInMemoryDB);
    try {
      const duplicatedTask = new TaskEntity("task");
      await createTaskUseCase.execute(TaskDTO.fromEntity(duplicatedTask));
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
      const duplicatedDueDateTask = new TaskEntity(
        "another task",
        false,
        duplicatedDueDate,
      );
      await createTaskUsecase.execute(
        TaskDTO.fromEntity(duplicatedDueDateTask),
      );
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

    const task = new TaskEntity("task");
    const taskDTO = await createTaskUseCase.execute(TaskDTO.fromEntity(task));
    assert.deepStrictEqual(taskDTO, TaskDTO.fromEntity(newTask));
  });
});
