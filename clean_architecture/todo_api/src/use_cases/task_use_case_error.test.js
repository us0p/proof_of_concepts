const TaskUseCaseError = require("./task_use_case_error");
const assert = require("node:assert");
const { describe, it } = require("node:test");

describe("Testing TaskUseCaseError initialization", () => {
  it("shouls throw an instance of TaskUseCaseError", () => {
    try {
      throw new TaskUseCaseError("error");
    } catch (e) {
      assert.strictEqual(e instanceof TaskUseCaseError, true);
      assert.strictEqual(e.message === "error", true);
    }
  });
});
