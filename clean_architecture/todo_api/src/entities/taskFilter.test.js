const assert = require("node:assert");
const { describe, it } = require("node:test");

const TaskFilterOptions = require("./taskFilter");
const TaskFilterOptionError = require("./taskFilter.error");

describe("Testing TaskFilterOptions buildOrdering method", () => {
  it("should throw a TaskFilterOptionError if invalid column is provided", () => {
    try {
      new TaskFilterOptions({ order: "asdf" });
      throw new Error("should have failed");
    } catch (e) {
      assert.strictEqual(e instanceof TaskFilterOptionError, true);
      assert.strictEqual(e.message, "Invalid column 'asdf'");
    }
  });
  it("should order a single column", () => {
    const taskFilterOptions = new TaskFilterOptions({ order: "name" });
    assert.deepStrictEqual(taskFilterOptions.orderBy, [{ column: "name" }]);
  });
  it("should order a single columns in decreasing order", () => {
    const taskFilterOptions = new TaskFilterOptions({ order: "name,DESC" });
    assert.deepStrictEqual(taskFilterOptions.orderBy, [
      { column: "name", decreasing: true },
    ]);
  });
  it("should order multiple columns mixing ascending and decreasing order", () => {
    const taskFilterOptions = new TaskFilterOptions({
      order: "name;completed,DESC",
    });
    assert.deepStrictEqual(taskFilterOptions.orderBy, [
      { column: "name" },
      { column: "completed", decreasing: true },
    ]);
  });
  it("should return undefined if there's no order option", () => {
    const taskFilterOptions = new TaskFilterOptions({});
    assert.deepStrictEqual(taskFilterOptions.orderBy, undefined);
  });
});

describe("Testing TaskFilterOptions buildFiltering method", () => {
  it("should throw a TaskFilterOptionError if completed column value is invalid", () => {
    try {
      new TaskFilterOptions({ filter: "completed,asdf" });
      throw new Error("should have failed");
    } catch (e) {
      assert.strictEqual(e instanceof TaskFilterOptionError, true);
      assert.strictEqual(e.message, "'completed' column must be a boolean");
    }
  });
  it("should throw a TaskFilterOptionError if dueDate has an invalid date", () => {
    try {
      new TaskFilterOptions({ filter: "dueDate,asdf" });
      throw new Error("should have failed");
    } catch (e) {
      assert.strictEqual(e instanceof TaskFilterOptionError, true);
      assert.strictEqual(e.message, "Invalid range 'asdf'");
    }
  });
  it("should throw a TaskFilterOptionError if dueDate has an invalid range", () => {
    try {
      new TaskFilterOptions({ filter: "dueDate,05/10/1998;01/10/1998" });
      throw new Error("should have failed");
    } catch (e) {
      assert.strictEqual(e instanceof TaskFilterOptionError, true);
      assert.strictEqual(e.message, "Start date can't be after end");
    }
  });
  it("should throw a TaskFilterOptionError if filter column is invalid", () => {
    try {
      new TaskFilterOptions({ filter: "asdf,fdsa" });
      throw new Error("should have failed");
    } catch (e) {
      assert.strictEqual(e instanceof TaskFilterOptionError, true);
      assert.strictEqual(e.message, "Invalid column 'asdf'");
    }
  });
  it("should undefined filterBy field if filter isn't provided", () => {
    const taskFilterOptions = new TaskFilterOptions({});
    assert.deepStrictEqual(taskFilterOptions.filterBy, undefined);
  });
  it("should return a filterBy object with name and value", () => {
    const taskFilterOptions = new TaskFilterOptions({ filter: "name,test" });
    assert.deepStrictEqual(taskFilterOptions.filterBy, {
      column: "name",
      value: "test",
    });
  });
  it("should return a filterBy object with completed and a boolean value", () => {
    const taskFilterOptions = new TaskFilterOptions({
      filter: "completed,true",
    });
    assert.deepStrictEqual(taskFilterOptions.filterBy, {
      column: "completed",
      value: true,
    });
  });
  it("should return a filterBy object with a Range object with a valid range", () => {
    const taskFilterOptions = new TaskFilterOptions({
      filter: "dueDate,05/10/1998;10/10/1998",
    });
    assert.deepStrictEqual(taskFilterOptions.filterBy, {
      column: "dueDate",
      value: {
        from: "1998-05-10T03:00:00.000Z",
        to: "1998-10-10T03:00:00.000Z",
      },
    });
  });
});
