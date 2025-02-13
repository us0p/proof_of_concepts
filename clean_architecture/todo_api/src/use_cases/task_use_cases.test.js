const assert = require("node:assert");
const { describe, it, before, mock, afterEach } = require("node:test");

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

  /**
   * @param {import("../entities/taskEntity").TaskPOJO} taskPOJO
   * @returns {Promise<import("./task_use_cases").TaskWithIDPOJO>}
   */
  async createTask(taskPOJO) {
    const id = this.#idGenerator++;
    const taskDB = { id, ...taskPOJO };
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
   * @return {Promise<import("./task_use_cases").TaskWithIDPOJO|null>}
   */
  async deleteTask(taskID) {
    const taskIndex = this.#db.findIndex((task) => task.id === taskID);
    if (taskIndex == -1) return null;
    const task = this.#db[taskIndex];
    this.#db.splice(taskIndex, 1);
    return task;
  }

  /**
   * @param {import("./task_use_cases").FilterOptions} filterOptions
   * @returns {Promise<DatabaseTask[]>}
   */
  async listTasks(filterOptions) {
    return this.#db;
  }

  /**
   * @param {number} id
   * @param {import("../entities/taskEntity").TaskPOJO} newTask
   * @returns {Promise<import("./task_use_cases").TaskWithIDPOJO | null>}
   */
  async updateTask(id, newTask) {
    const task = this.#db.find((task) => task.id === id);
    if (!task) return null;
    return Object.assign(task, newTask);
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
  it("should return the created taskPOJO", async () => {
    const task = new TaskEntity("task", false, "05/10/1998");
    const mockInMemoryDB = new MockInMemoryDB();
    const taskUseCases = new TaskUseCases(mockInMemoryDB);
    const taskPOJO = await taskUseCases.createTask(task.getPublicData());
    assert.deepStrictEqual(taskPOJO, {
      id: 1,
      ...task.getPublicData(),
    });
  });
  it("should throw an error if task name is duplicated", async () => {
    const mockInMemoryDB = new MockInMemoryDB();
    const mockTask = new TaskEntity("task");
    const taskUseCases = new TaskUseCases(mockInMemoryDB);
    await taskUseCases.createTask(mockTask.getPublicData());
    try {
      const duplicatedTask = new TaskEntity("task");
      await taskUseCases.createTask(duplicatedTask.getPublicData());
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
    await taskUseCase.createTask(mockTask.getPublicData());
    try {
      const duplicatedDueDateTask = new TaskEntity(
        "another task",
        false,
        "05/10/1998",
      );
      await taskUseCase.createTask(duplicatedDueDateTask.getPublicData());
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
    const createdTask = await taskUseCases.createTask(task.getPublicData());
    const deletedTask = await taskUseCases.deleteTask(createdTask.id);
    assert.deepStrictEqual(deletedTask, createdTask);
  });
});

describe("Testing TaskUseCases listTasks method", () => {
  const mockDatabase = new MockInMemoryDB();

  before(async () => {
    const taskUseCases = new TaskUseCases(mockDatabase);
    for (let i = 0; i < 10; i++) {
      const task = new TaskEntity(
        `task ${i + 1}`,
        i % 2 == 0,
        new Date(1998, 9, i + 1).toISOString(),
      );
      await taskUseCases.createTask(task.getPublicData());
    }

    const tasks = await mockDatabase.listTasks();
    const mockListTasks = mock.fn(async (filterOptions) => tasks);
    mockDatabase.listTasks = mockListTasks;
  });

  afterEach(() => {
    mockDatabase.listTasks.mock.resetCalls();
  });

  it("should be possible to pass a FilterOptions object with filter and ordering parameters", async () => {
    const taskUseCases = new TaskUseCases(mockDatabase);
    const filterOptionTestCases = [
      {
        filter: undefined,
        errorMessage: "should have called db method without arguments",
      },
      {
        filter: { orderBy: [{ column: "name" }] },
        errorMessage: "should have called db method with only column parameter",
      },
      {
        filter: { orderBy: [{ column: "name" }, { column: "dueDate" }] },
        errorMessage: "should have called db method with two columns",
      },
      {
        filter: { orderBy: [{ column: "name", decreasing: true }] },
        errorMessage:
          "should have called db method with a column and an ordering criteria",
      },
      {
        filter: { filter: { column: "name", value: "task 5" } },
        errorMessage:
          "should have called db method only with filter options for the name column",
      },
      {
        filter: { filter: { column: "completed", value: false } },
        errorMessage:
          "should have called db method with only with filter options for the completed column",
      },
      {
        filter: {
          filter: {
            column: "dueDate",
            value: { from: "05/10/1998", to: "09/10/1998" },
          },
        },
        errorMessage:
          "should have called db method only with filter options for the dueDate column",
      },
      {
        filter: {
          orderBy: [{ column: "name" }],
          filter: { column: "name", value: "task 1" },
        },
        errorMessage:
          "should have called db method with a combination of ordering and filtering",
      },
    ];
    for (const filterOptionTestCase of filterOptionTestCases) {
      const tasks = await taskUseCases.listTasks(filterOptionTestCase.filter);
      assert.strictEqual(mockDatabase.listTasks.mock.callCount(), 1);
      assert.deepStrictEqual(
        mockDatabase.listTasks.mock.calls[0].arguments,
        [filterOptionTestCase.filter],
        filterOptionTestCase.errorMessage,
      );
      assert.deepStrictEqual(
        tasks,
        await mockDatabase.listTasks.mock.calls[0].result,
      );
      mockDatabase.listTasks.mock.resetCalls();
    }
  });
});

describe("Testing TaskUseCases updateTask method", () => {
  const mockDatabase = new MockInMemoryDB();

  before(async () => {
    for (let i = 0; i < 2; i++) {
      const entity = new TaskEntity(
        `task ${i + 1}`,
        false,
        new Date(1998, 9, i + 1).toISOString(),
      );
      await mockDatabase.createTask(entity.getPublicData());
    }
  });

  it("should return null if provided id doesn't exist", async () => {
    const useCase = new TaskUseCases(mockDatabase);
    const entity = new TaskEntity("task");
    const updatedTask = await useCase.updateTask(
      Number.MAX_SAFE_INTEGER,
      entity.getPublicData(),
    );
    assert.strictEqual(updatedTask, null);
  });

  it("shouldn't be possible to update the task name to an existing name", async () => {
    const useCase = new TaskUseCases(mockDatabase);
    const entity = new TaskEntity("task 2");
    try {
      await useCase.updateTask(1, entity.getPublicData());
      throw new Error("should have failed with TaskUseCaseError");
    } catch (e) {
      assert.strictEqual(e instanceof TaskUseCaseError, true);
      assert.strictEqual(e.message, "Task with name 'task 2' already existis");
    }
  });

  it("shouldn't be possible to update the task to an existing date", async () => {
    const useCase = new TaskUseCases(mockDatabase);
    const entity = new TaskEntity(
      "task 1",
      false,
      new Date(1998, 9, 2).toISOString(),
    );
    try {
      await useCase.updateTask(1, entity.getPublicData());
      throw new Error("should have failed with TaskUseCaseError");
    } catch (e) {
      assert.strictEqual(e instanceof TaskUseCaseError, true);
      assert.strictEqual(
        e.message,
        `Due date ${new Date(entity.dueDate).toLocaleString()} already exists.`,
      );
    }
  });

  it("should return the updated task", async () => {
    const useCase = new TaskUseCases(mockDatabase);
    const entity = new TaskEntity("task 3", true, new Date(1998, 9, 3));
    const updatedTask = await useCase.updateTask(1, entity.getPublicData());
    assert.deepStrictEqual({ id: 1, ...entity.getPublicData() }, updatedTask);
  });
});
