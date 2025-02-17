const UseCaseError = require("./useCase.error");
const assert = require("node:assert");
const { describe, it } = require("node:test");

describe("Testing UseCaseError initialization", () => {
  it("should throw an instance of UseCaseError", () => {
    try {
      throw new UseCaseError("error");
    } catch (e) {
      assert.strictEqual(e instanceof UseCaseError, true);
      assert.strictEqual(e.message === "error", true);
    }
  });
});
