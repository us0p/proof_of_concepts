const assert = require("node:assert");
const { describe, it, mock } = require("node:test");
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

  // should replace calls of entity.isDueDateValid over the code base.
  describe("Testing isEntityValid method", () => {
    it("should return false if name is missing", async () => {
      const task = new TaskEntity("");
      const isTaskValid = task.isEntityValid();
      assert.strictEqual(isTaskValid, false);
    });

    it("should call isDueDateValid to check if dueDate is valid", async () => {
      const task = new TaskEntity("task", true, "asdf");
      task.isDueDateValid = mock.fn(() => false);
      const isTaskValid = task.isEntityValid();
      assert.strictEqual(isTaskValid, false);
      assert.strictEqual(task.isDueDateValid.mock.callCount(), 1);
    });

    it("should return false if completed isn't a boolean", async () => {
      const task = new TaskEntity("name", "asdf");
      const isTaskValid = task.isEntityValid();
      assert.strictEqual(isTaskValid, false);
    });

    it("should return true if all fields are ok", async () => {
      const today = new Date();
      today.setDate(today.getDate() + 5);
      const task = new TaskEntity("name", true, today.toLocaleDateString());
      const isTaskValid = task.isEntityValid();
      assert.strictEqual(isTaskValid, true);
    });
  });
});
