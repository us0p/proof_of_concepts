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

describe("Testing deleteTask method", () => {
  it("should return the appropriate status and responde body given an input", async () => {
    const testCases = [
      {
        taskID: Number.MAX_SAFE_INTEGER,
        mockReturnValue: null,
        expected: {
          statusCode: 400,
          data: {
            message: `Task with ID ${Number.MAX_SAFE_INTEGER} doesn't exist`,
          },
        },
      },
      {
        taskID: 1,
        mockReturnValue: { name: "task", completed: false, dueDate: null },
        expected: {
          statusCode: 204,
          data: undefined,
        },
      },
    ];

    for (const testCase of testCases) {
      const taskUseCase = {};
      taskUseCase.deleteTask = mock.fn(async (_) => testCase.mockReturnValue);
      const taskController = new TaskController(taskUseCase);
      const apiResponse = await taskController.deleteTask(testCase.taskID);
      assert.deepStrictEqual(apiResponse, testCase.expected);
      assert.strictEqual(taskUseCase.deleteTask.mock.callCount(), 1);
      assert.deepStrictEqual(taskUseCase.deleteTask.mock.calls[0].arguments, [
        testCase.taskID,
      ]);
    }
  });
});

describe("Testing listTasks method", () => {
  it("should correctly call the useCase listTask method with the appropriated filters", async () => {
    const testCases = require("./test_cases.json");
    const taskUseCase = {};
    taskUseCase.listTasks = mock.fn(async (_) => []);
    const taskController = new TaskController(taskUseCase);
    for (const testCase of testCases) {
      const apiResponse = await taskController.listTasks(testCase.filterParams);
      assert.deepStrictEqual(apiResponse, testCase.expected, testCase.name);
      assert.strictEqual(
        taskUseCase.listTasks.mock.callCount(),
        testCase.expectedMockCallCount,
        testCase.name,
      );
      if (testCase.expectedMockCallCount > 0) {
        assert.deepStrictEqual(
          taskUseCase.listTasks.mock.calls[0].arguments,
          [testCase.expectedMockArguments],
          testCase.name,
        );
      }
      taskUseCase.listTasks.mock.resetCalls();
    }
  });
});

describe("Testing updateTask method", () => {
  it("should return the apprpriate responde body given an input", async () => {
    const testCases = [
      {
        name: "testing invalid dueDate",
        taskID: Number.MAX_SAFE_INTEGER,
        body: { name: "task", dueDate: "asdf" },
        mockReturnValue: null,
        expectedAPIResponse: {
          statusCode: 400,
          data: {
            message: `Due date 'asdf' is invalid`,
          },
        },
        expectedMockCallCount: 0,
        expectedMockCallArguments: undefined,
      },
      {
        name: "testing invalid taskID",
        taskID: Number.MAX_SAFE_INTEGER,
        body: { name: "task" },
        mockReturnValue: null,
        expectedAPIResponse: {
          statusCode: 400,
          data: {
            message: `Task with ID ${Number.MAX_SAFE_INTEGER} doesn't exist`,
          },
        },
        expectedMockCallCount: 1,
        expectedMockCallArguments: [
          Number.MAX_SAFE_INTEGER,
          { name: "task", completed: false, dueDate: null },
        ],
      },
      {
        name: "testing task updating",
        taskID: 1,
        body: { name: "task" },
        mockReturnValue: {
          id: 1,
          name: "task",
          completed: false,
          dueDate: null,
        },
        expectedAPIResponse: {
          statusCode: 200,
          data: { id: 1, name: "task", completed: false, dueDate: null },
        },
        expectedMockCallCount: 1,
        expectedMockCallArguments: [
          1,
          { name: "task", completed: false, dueDate: null },
        ],
      },
    ];

    for (const testCase of testCases) {
      const taskUseCases = {};
      taskUseCases.updateTask = mock.fn(
        async (_, __) => testCase.mockReturnValue,
      );
      const taskController = new TaskController(taskUseCases);
      const apiResponse = await taskController.updateTask(
        testCase.taskID,
        testCase.body,
      );
      assert.deepStrictEqual(
        apiResponse,
        testCase.expectedAPIResponse,
        testCase.name,
      );
      assert.strictEqual(
        taskUseCases.updateTask.mock.callCount(),
        testCase.expectedMockCallCount,
        testCase.name,
      );
      if (testCase.expectedMockCallCount > 0) {
        assert.deepStrictEqual(
          taskUseCases.updateTask.mock.calls[0].arguments,
          testCase.expectedMockCallArguments,
          testCase.name,
        );
      }
    }
  });
  it("should return a status 400 with the provided error message if any use case error is raised", async () => {
    const taskUseCases = {};
    taskUseCases.updateTask = mock.fn(async (_, __) => {
      throw new TaskUseCaseError("error");
    });
    const taskController = new TaskController(taskUseCases);
    const apiResponse = await taskController.updateTask(1, { name: "task" });
    assert.deepStrictEqual(apiResponse, {
      statusCode: 400,
      data: { message: "error" },
    });
    assert.strictEqual(taskUseCases.updateTask.mock.callCount(), 1);
    assert.deepStrictEqual(taskUseCases.updateTask.mock.calls[0].arguments, [
      1,
      { name: "task", completed: false, dueDate: null },
    ]);
  });
});
