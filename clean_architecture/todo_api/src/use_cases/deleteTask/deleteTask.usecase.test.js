const assert = require("node:assert");
const { describe, it, mock } = require("node:test");
const DeleteTaskUseCase = require("./deleteTask.usecase");
const TaskEntity = require("../../entities/taskEntity");
const TaskDTO = require("../interfaces/task.dto");

describe("Testing DeleteTaskUseCase", () => {
  it("should return null if the provided id doesn't exist in the database", async () => {
    const mockDatabase = {};
    mockDatabase.deleteTask = mock.fn(async (_) => null);
    const deleteTaskUseCase = new DeleteTaskUseCase(mockDatabase);
    const deletedTask = await deleteTaskUseCase.execute(69);
    assert.strictEqual(deletedTask, null);
    assert.strictEqual(mockDatabase.deleteTask.mock.callCount(), 1);
    assert.deepStrictEqual(mockDatabase.deleteTask.mock.calls[0].arguments, [
      69,
    ]);
  });
  it("should return the dto of the deleted task", async () => {
    const mockDatabase = {};
    const task = new TaskEntity("task");
    task.setID(1);
    const createdTaskDTO = TaskDTO.fromEntity(task);

    mockDatabase.deleteTask = mock.fn(async (_) => createdTaskDTO);
    const deleteTaskUseCase = new DeleteTaskUseCase(mockDatabase);

    const deletedTask = await deleteTaskUseCase.execute(1);
    assert.deepStrictEqual(deletedTask, createdTaskDTO);
  });
});
