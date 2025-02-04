const assert = require("node:assert");
const { describe, it } = require("node:test");
const TaskUseCases = require("./task_use_cases");
const TaskEntity = require("../entities/taskEntity");
const TaskUseCaseError = require("./task_use_case_error");

/**
 * @typedef {Object} DatabaseTask
 * @property {number} id
 * @property {string} name
 * @property {boolean} completed
 * @property {string} dueDate
 */

class MockInMemoryDB {
  /**
   * @type {DatabaseTask[]}
   */
  #db = [];
  #idGenerator = 1;

  async createTask(taskDTO) {
    const id = this.#idGenerator++;
    const taskDB = { id, ...taskDTO };
    this.#db.push(taskDB);
    return taskDB;
  }

  /**
   * @param {string} name
   */
  async getTaskByName(name) {
    return this.#db.find((task) => task.name === name);
  }

  /**
   * @param {string} dueDate
   */
  async getTaskByDueDate(dueDate) {
    return this.#db.find((task) => task.dueDate === dueDate);
  }

  /**
   * @param {number} taskID
   * @return {Promise<import("./task_use_cases").TaskWithIDDTO|null>}
   */
  async deleteTask(taskID) {
    const taskIndex = this.#db.findIndex((task) => task.id === taskID);
    if (taskIndex == -1) return null;
    const task = this.#db[taskIndex];
    this.#db.splice(taskIndex, 1);
    return task;
  }
}

describe("Testing TaskUseCases initialization", () => {
  it("should produce a create task use case instance with access to the database", () => {
    const mockInMemoryDB = new MockInMemoryDB();
    const taskUseCases = new TaskUseCases(mockInMemoryDB);
    assert.deepStrictEqual(taskUseCases.db, mockInMemoryDB);
  });
});

describe("Testing TaskUseCases createTask method", () => {
  it("should return the created taskDTO", async () => {
    const task = new TaskEntity("task", false, "05/10/1998");
    const mockInMemoryDB = new MockInMemoryDB();
    const taskUseCases = new TaskUseCases(mockInMemoryDB);
    const taskDTO = await taskUseCases.createTask(task);
    assert.deepStrictEqual(taskDTO, {
      id: 1,
      ...task.getDTO(),
    });
  });
  it("should throw an error if task name is duplicated", async () => {
    const mockInMemoryDB = new MockInMemoryDB();
    const mockTask = new TaskEntity("task");
    const taskUseCases = new TaskUseCases(mockInMemoryDB);
    await taskUseCases.createTask(mockTask);
    try {
      const duplicatedTask = new TaskEntity("task");
      await taskUseCases.createTask(duplicatedTask);
      throw Error("Should have failed with duplicated task name 'task'");
    } catch (e) {
      assert.strictEqual(e instanceof TaskUseCaseError, true);
      assert.strictEqual(e.message === "Duplicated task name 'task'", true);
    }
  });
  it("should throw an error if task dueDate is duplicated", async () => {
    const mockInMemoryDB = new MockInMemoryDB();
    const taskUseCase = new TaskUseCases(mockInMemoryDB);
    const mockTask = new TaskEntity("task", false, "05/10/1998");
    await taskUseCase.createTask(mockTask);
    try {
      const duplicatedDueDateTask = new TaskEntity(
        "another task",
        false,
        "05/10/1998",
      );
      await taskUseCase.createTask(duplicatedDueDateTask);
      throw Error("Should have failed with duplicated due date");
    } catch (e) {
      assert.strictEqual(e instanceof TaskUseCaseError, true);
      assert.strictEqual(
        e.message === "Cannot schedule two tasks for the same time",
        true,
      );
    }
  });
});

describe("Testing TaskUseCases deleteTask method", () => {
  it("should return null if the provided id doesn't exist in the database", async () => {
    const mockDatabase = new MockInMemoryDB();
    const taskUseCases = new TaskUseCases(mockDatabase);
    const deletedTask = await taskUseCases.deleteTask(69);
    assert.strictEqual(deletedTask, null);
  });
  it("should return the dto of the deleted task", async () => {
    const mockDatabase = new MockInMemoryDB();
    const taskUseCases = new TaskUseCases(mockDatabase);
    const task = new TaskEntity("task");
    const createdTask = await taskUseCases.createTask(task);
    const deletedTask = await taskUseCases.deleteTask(createdTask.id);
    assert.deepStrictEqual(deletedTask, createdTask);
  });
});
