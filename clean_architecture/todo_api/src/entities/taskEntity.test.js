const assert = require("node:assert");
const { describe, it } = require("node:test");
const TaskEntity = require("./taskEntity");
const TaskEntityError = require("./taskEntity.error");

describe("Testing entity validate method", () => {
  it("should throw an error if name is missing", async () => {
    try {
      const entity = new TaskEntity("");
      entity.validate();
      throw new Error("should have failed with TaskEntityError");
    } catch (e) {
      assert.strictEqual(e.message, "'name' is a required field");
      assert.strictEqual(e instanceof TaskEntityError, true);
    }
  });

  it("should return false if completed isn't a boolean", async () => {
    try {
      const entity = new TaskEntity("task", "asdf");
      entity.validate();
      throw new Error("should have failed with TaskEntityError");
    } catch (e) {
      assert.strictEqual(e.message, "'completed' must be a boolean");
      assert.strictEqual(e instanceof TaskEntityError, true);
    }
  });
  it("should throw error for date format asdf", () => {
    try {
      const entity = new TaskEntity("task", false, "asdf");
      entity.validate();
      throw new Error("should have failed with TaskEntityError");
    } catch (e) {
      assert.strictEqual(e.message, "Invalid dueDate 'asdf'");
      assert.strictEqual(e instanceof TaskEntityError, true);
    }
  });

  it("should throw error date in the past", () => {
    try {
      const entity = new TaskEntity("task", true, "05/10/1998");
      entity.validate();
      throw new Error("should have failed with TaskEntityError");
    } catch (e) {
      assert.strictEqual(
        e.message,
        "Can't create a task with a dueDate in the past",
      );
      assert.strictEqual(e instanceof TaskEntityError, true);
    }
  });

  it("should create a TaskEntity instance if only name is provided", () => {
    const task = new TaskEntity("task");
    task.validate();
    assert.strictEqual(task.name, "task");
    assert.strictEqual(task.completed, false);
    assert.strictEqual(task.dueDate, null);
    assert.strictEqual(task.id, undefined);
  });

  it("should create a instance if dueDate is greater or equal to today even if earlier in the day", (t) => {
    t.mock.timers.enable({ apis: ["Date"] });
    const MS_IN_TWELVE_HOURS = 1000 * 60 * 60 * 12;
    t.mock.timers.tick(MS_IN_TWELVE_HOURS);
    const todaySixAM = new Date();
    todaySixAM.setUTCHours(6);
    const task = new TaskEntity("task", false, todaySixAM.toISOString());
    task.validate();
    assert.strictEqual(task.dueDate, todaySixAM.toISOString());
  });
});

describe("Testing task entity setID method", () => {
  it("should set the provided ID in the entity", () => {
    const entity = new TaskEntity("task");
    entity.setID(1);
    assert.strictEqual(entity.id, 1);
  });
});
