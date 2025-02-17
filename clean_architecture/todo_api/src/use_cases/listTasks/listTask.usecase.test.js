const assert = require("node:assert");
const { describe, it, mock } = require("node:test");

const ListTasksUseCase = require("./listTask.usecase");
const TaskEntity = require("../../entities/taskEntity");
const TaskDTO = require("../interfaces/task.dto");

describe("Testing ListTasksUseCase", () => {
  it("should call repo listTasks method with provided filterOptions and return its results as an array of TaskDTOs", async () => {
    const entitiesWithID = [new TaskEntity("task 1"), new TaskEntity("task 2")];
    entitiesWithID.forEach((t, idx) => t.setID(idx + 1));

    const mockDatabase = {};
    mockDatabase.listTasks = mock.fn(async (_) => entitiesWithID);

    const filterOptions = {
      orderBy: [{ column: "name" }, { column: "dueDate", decreasing: true }],
      filter: {
        column: "dueDate",
        value: { from: "05/10/1998", to: "10/10/1998" },
      },
    };

    const listTaskUseCase = new ListTasksUseCase(mockDatabase);
    const tasks = await listTaskUseCase.execute(filterOptions);

    assert.strictEqual(mockDatabase.listTasks.mock.callCount(), 1);
    assert.deepStrictEqual(mockDatabase.listTasks.mock.calls[0].arguments, [
      filterOptions,
    ]);
    assert.deepStrictEqual(
      tasks,
      entitiesWithID.map((e) => TaskDTO.fromEntity(e)),
    );
    mockDatabase.listTasks.mock.resetCalls();
  });
});
