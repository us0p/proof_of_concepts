const assert = require("node:assert");
const { describe, it } = require("node:test");
const TaskEntity = require("./taskEntity");

describe("Testing TaskEntity", () => {
  describe("Testing proper property initialization", () => {
    it("should create a task default values for due date and completed fields", () => {
      const task = new TaskEntity("task");
      assert.strictEqual(task.name, "task");
      assert.strictEqual(task.completed, false);
      assert.strictEqual(task.dueDate, null);
    });

    it("should create a task with completed set to true", () => {
      const task = new TaskEntity("task", true);
      assert.strictEqual(task.completed, true);
    });

    it("should create a task with dueDate set to now", () => {
      const task = new TaskEntity("task", true, "29/01/2025");
      assert.strictEqual(task.dueDate, "29/01/2025");
    });
  });

  describe("Testing isDueDateValid method", () => {
    it("should return false for date format 20,10,20", () => {
      const task = new TaskEntity("task", false, "20,10,20");
      const isDueDateValid = task.isDueDateValid();
      assert.strictEqual(isDueDateValid, false);
    });

    it("should return false for date format asdf", () => {
      const task = new TaskEntity("task", false, "asfd");
      const isDueDateValid = task.isDueDateValid();
      assert.strictEqual(isDueDateValid, false);
    });

    it("should return false for date 05/10/1998", () => {
      const task = new TaskEntity("task", true, "05/10/1998");
      const isDueDateValid = task.isDueDateValid();
      assert.strictEqual(isDueDateValid, false);
    });

    it("should return true for null date", () => {
      const task = new TaskEntity("task");
      const isDueDateValid = task.isDueDateValid();
      assert.strictEqual(isDueDateValid, true);
    });

    it("should return true for date five days in the future", () => {
      const dateFiveDaysInTheFuture = new Date();
      dateFiveDaysInTheFuture.setDate(dateFiveDaysInTheFuture.getDate() + 5);
      const task = new TaskEntity(
        "task",
        false,
        dateFiveDaysInTheFuture.toISOString(),
      );
      const isDueDateValid = task.isDueDateValid();
      assert.strictEqual(isDueDateValid, true);
    });
  });

  describe("Testing getPublicData method", () => {
    it("should return a POJO representation of the entity", () => {
      const dueDate = new Date().toISOString();
      const task = new TaskEntity("task", false, dueDate);
      const publicData = task.getPublicData();
      assert.deepStrictEqual(publicData, {
        name: "task",
        completed: false,
        dueDate,
      });
    });

    it("should return an ISO format date at the dueDate", () => {
      const date = "05/10/1998";
      const task = new TaskEntity("task", false, date);
      const publicData = task.getPublicData();
      assert.strictEqual(publicData.dueDate, new Date(date).toISOString());
    });

    it("should return null for dueDate if dueDate isn't provided", () => {
      const task = new TaskEntity("task");
      const publicData = task.getPublicData();
      assert.strictEqual(publicData.dueDate, null);
    });
  });
});
