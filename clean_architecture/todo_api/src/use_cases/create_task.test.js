const assert = require("node:assert");
const { describe, it } = require("node:test");
const CreateTaskUseCase = require("./create_task");
const TaskEntity = require("../entities/taskEntity");

class MockInMemoryDB {
  #db = [];
  #idGenerator = 1;

  async createTask(taskDTO) {
    const taskDB = { id: this.#idGenerator++, ...taskDTO };
    this.#db.push(taskDB);
    return taskDB;
  }
}

describe("Testing CreateTaskUseCase", () => {
  describe("Testing CreateTaskUseCase initialization", () => {
    it("should produce a create task use case instance with access to the task entity and database", () => {
      const task = new TaskEntity("task");
      const mockInMemoryDB = new MockInMemoryDB();
      const createTaskUseCase = new CreateTaskUseCase(task, mockInMemoryDB);
      assert.deepStrictEqual(createTaskUseCase.task, task);
      assert.deepStrictEqual(createTaskUseCase.db, mockInMemoryDB);
    });
  });
});
