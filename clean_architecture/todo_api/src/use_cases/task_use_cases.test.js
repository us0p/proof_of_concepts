const assert = require("node:assert");
const { describe, it, before } = require("node:test");

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

  /**
   * @typedef {Object} FilterOptions
   * @property {OrderBy[]=} orderBy
   * @property {FilterBy=} filter
   */

  /**
   * @typedef {Object} OrderBy
   * @property {string} column
   * @property {boolean=} decreasing
   */

  /**
   * @typedef {Object} Range
   * @property {string} from
   * @property {string} to
   */

  /**
   * @typedef {Object} FilterBy
   * @property {string} column
   * @property {string|boolean|Range} value
   */

  /**
   * @param {FilterOptions} filterOptions
   * @returns {Promise<DatabaseTask[]>}
   */
  async listTasks(filterOptions) {
    return this.#db;
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

describe("Testing TaskUseCases listTasks method", () => {
  // listTasks is a simple plumber method, it passes the filter option to
  // the database layer which actually apply the filtering logic to the
  // query.
  // The tests should only assert if this method is correctly passing
  // filter to the database method
  const mockDatabase = new MockInMemoryDB();

  before(async () => {
    const taskUseCases = new TaskUseCases(mockDatabase);
    for (let i = 0; i < 10; i++) {
      const task = new TaskEntity(
        `task ${i + 1}`,
        i % 2 == 0,
        new Date(1998, 9, i + 1).toISOString(),
      );
      await taskUseCases.createTask(task);
    }
  });

  it("should return an id ordered list of all tasks", async () => {
    const taskUseCases = new TaskUseCases(mockDatabase);
    const tasks = await taskUseCases.listTasks();
    const mockDBTasks = await mockDatabase.listTasks();
    assert.deepStrictEqual(tasks, mockDBTasks);
  });
  it("should be possible to pass an array of order objects to apply to columns", async () => {
    const taskUseCases = new TaskUseCases(mockDatabase);
    const filterOptionTestCases = [
      {
        filter: { orderBy: [{ column: "name" }] },
        errorMessage: "should have ordered stasks by name",
      },
      {
        filter: { orderBy: [{ column: "name" }, { column: "dueDate" }] },
        errorMessage: "should have ordered stasks by name and due date",
      },
      {
        filter: { orderBy: [{ column: "name", decreasing: true }] },
        errorMessage: "should have ordered stasks by name in decreasing order",
      },
    ];
    for (const filterOptionTestCase of filterOptionTestCases) {
      const tasks = await taskUseCases.listTasks(filterOptionTestCase.filter);
      const mockDBTasks = await mockDatabase.listTasks(
        filterOptionTestCase.filter,
      );
      assert.deepStrictEqual(
        tasks,
        mockDBTasks,
        filterOptionTestCase.errorMessage,
      );
    }
  });
  it("should be possible to apply filters to columns", async () => {
    const taskUseCases = new TaskUseCases(mockDatabase);
    const filterOptionTestCases = [
      {
        filter: { filter: { column: "name", value: "task 5" } },
        errorMessage:
          "should have returned an array with only a single task with name 'task 5'",
      },
      {
        filter: { filter: { column: "completed", value: false } },
        errorMessage:
          "should have returned an array with only tasks that aren't completed",
      },
      {
        filter: {
          filter: {
            column: "dueDate",
            value: { from: "05/10/1998", to: "09/10/1998" },
          },
        },
        errorMessage:
          "should have returned only tasks between 05/10/1998 and 09/10/1998",
      },
    ];
    for (const filterOptionTestCase of filterOptionTestCases) {
      const tasks = await taskUseCases.listTasks(filterOptionTestCase.filter);
      const mockDBTasks = await mockDatabase.listTasks(
        filterOptionTestCase.filter,
      );
      assert.deepStrictEqual(
        tasks,
        mockDBTasks,
        filterOptionTestCase.errorMessage,
      );
    }
  });
});
