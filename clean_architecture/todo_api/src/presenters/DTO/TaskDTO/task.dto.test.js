const assert = require("node:assert");
const { describe, it } = require("node:test");
const TaskDTO = require("./task.dto");

describe("Testing TaskDTO initialization", () => {
  it("should return a TaskDTO instance with all the required properties of a task", () => {
    const date = new Date().toISOString();
    const taskDTO = new TaskDTO("task", false, date);
    assert.strictEqual(taskDTO.name, "task");
    assert.strictEqual(taskDTO.completed, false);
    assert.strictEqual(taskDTO.dueDate, date);
  });
});
