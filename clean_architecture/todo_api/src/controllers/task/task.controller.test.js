const assert = require("node:assert");
const { describe, it, mock } = require("node:test");
const TaskController = require("./task.controller");
const TaskUseCaseError = require("../../use_cases/task_use_case_error");

describe("Testing TaskController initialization", () => {
  it("should return a TaskController instance with access to the use case", () => {
    const mockUseCase = {};
    const taskController = new TaskController(mockUseCase);
    assert.deepStrictEqual(taskController.taskUseCases, mockUseCase);
  });
});

describe("Testing TaskController createTask method", () => {
  it("should fail with status code 400 and error message if due date is invalid", async () => {
    const taskUseCase = {};
    const taskController = new TaskController(taskUseCase);
    const body = { dueDate: "invalid date" };
    const apiResponse = await taskController.createTask(body);
    assert.deepStrictEqual(apiResponse, {
      statusCode: 400,
      data: {
        message: `due date '${body.dueDate}' is invalid`,
      },
    });
  });

  it("should fail with status code 400 and error message if provided data is wrong", async () => {
    const todayPlus5 = new Date();
    todayPlus5.setDate(todayPlus5.getDate() + 5);
    const testCases = [
      {
        emitedErrorMessage: "duplicated name",
        body: { name: "task" },
        expectedApiResponse: {
          statusCode: 400,
          data: {
            message: "duplicated name",
          },
        },
        expectedCreateTaskUseCaseArguments: [
          { name: "task", completed: false, dueDate: null },
        ],
      },
      {
        emitedErrorMessage: "duplicated dueDate",
        body: { name: "task", dueDate: todayPlus5.toISOString() },
        expectedApiResponse: {
          statusCode: 400,
          data: {
            message: "duplicated dueDate",
          },
        },
        expectedCreateTaskUseCaseArguments: [
          { name: "task", completed: false, dueDate: todayPlus5.toISOString() },
        ],
      },
    ];

    for (const testCase of testCases) {
      const taskUseCases = {};
      taskUseCases.createTask = mock.fn(async (_) => {
        throw new TaskUseCaseError(testCase.emitedErrorMessage);
      });
      const taskController = new TaskController(taskUseCases);
      const apiResponse = await taskController.createTask(testCase.body);
      assert.deepStrictEqual(apiResponse, testCase.expectedApiResponse);
      assert.strictEqual(taskUseCases.createTask.mock.callCount(), 1);
      assert.deepStrictEqual(
        taskUseCases.createTask.mock.calls[0].arguments,
        testCase.expectedCreateTaskUseCaseArguments,
      );
    }
  });

  it("should return a status code 201 and the created task with an ID", async () => {
    const taskUseCase = {};
    taskUseCase.createTask = mock.fn(async (taskPOJO) => {
      return { id: 1, ...taskPOJO };
    });
    const taskController = new TaskController(taskUseCase);
    const todayPlus5 = new Date();
    todayPlus5.setDate(todayPlus5.getDate() + 5);
    const body = { name: "task", dueDate: todayPlus5.toISOString() };
    const apiResponse = await taskController.createTask(body);
    assert.deepStrictEqual(apiResponse, {
      statusCode: 201,
      data: {
        id: 1,
        name: "task",
        completed: false,
        dueDate: todayPlus5.toISOString(),
      },
    });
    assert.strictEqual(taskUseCase.createTask.mock.callCount(), 1);
    assert.deepStrictEqual(taskUseCase.createTask.mock.calls[0].arguments, [
      { name: "task", completed: false, dueDate: todayPlus5.toISOString() },
    ]);
  });

  it("should throw an error if any other error is emitted", async () => {
    const taskUseCase = {};
    taskUseCase.createTask = mock.fn(async (_) => {
      throw new Error("unexpected error!");
    });
    const taskController = new TaskController(taskUseCase);
    const body = { name: "task" };
    try {
      await taskController.createTask(body);
      throw new Error("should have failed with an unexpected error");
    } catch (e) {
      assert.strictEqual(e instanceof Error, true);
      assert.strictEqual(e.message, "unexpected error!");
    }
  });
});
