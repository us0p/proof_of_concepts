const assert = require("node:assert");
const { describe, it, mock } = require("node:test");
const TaskController = require("./task.controller");
const UseCaseError = require("../../use_cases/useCase.error");
const APIResponse = require("../../presenters/api/api_response.presenter");
const TaskDTO = require("../../use_cases/interfaces/task.dto");
const TaskFilterOptions = require("../../entities/taskFilter");
const TaskEntityError = require("../../entities/taskEntity.error");
const TaskPOJO = require("../../entities/taskPOJO");

describe("Testing TaskController createTask method", () => {
  it("should fail with status code 400 and error message if task data is invalid", async () => {
    const testCases = [
      {
        reqBody: { name: "" },
        resBody: new APIResponse(400, {
          message: "'name' is a required field",
        }),
        message: "should have failed with invalid name",
      },
      {
        reqBody: {
          name: "task",
          completed: "asdf",
        },
        resBody: new APIResponse(400, {
          message: "'completed' must be a boolean",
        }),
        message: "should have failed with invalid completed field",
      },
      {
        reqBody: {
          name: "task",
          dueDate: "invalid date",
        },
        resBody: new APIResponse(400, {
          message: "Invalid dueDate 'invalid date'",
        }),
        message: "should have failed with invalid date",
      },
    ];
    const taskController = new TaskController();
    for (const testCase of testCases) {
      const createTaskUseCase = {};
      createTaskUseCase.execute = mock.fn(async (_) => {
        throw new TaskEntityError(testCase.resBody.data.message);
      });
      const apiResponse = await taskController.createTask(
        createTaskUseCase,
        testCase.reqBody,
      );
      assert.deepStrictEqual(apiResponse, testCase.resBody, testCase.message);
    }
  });

  it("should fail with status code 400 and error message if provided data is wrong", async () => {
    const today = new Date().toISOString();
    const testCases = [
      {
        emitedErrorMessage: "duplicated name",
        body: { name: "task" },
        expectedApiResponse: new APIResponse(400, {
          message: "duplicated name",
        }),
        expectedCreateTaskUseCaseArguments: [
          new TaskPOJO("task", undefined, undefined),
        ],
      },
      {
        emitedErrorMessage: "duplicated dueDate",
        body: { name: "task", dueDate: today },
        expectedApiResponse: new APIResponse(400, {
          message: "duplicated dueDate",
        }),
        expectedCreateTaskUseCaseArguments: [
          new TaskPOJO("task", undefined, today),
        ],
      },
    ];

    for (const testCase of testCases) {
      const createTaskUseCase = {};
      createTaskUseCase.execute = mock.fn(async (_) => {
        throw new UseCaseError(testCase.emitedErrorMessage);
      });
      const taskController = new TaskController();
      const apiResponse = await taskController.createTask(
        createTaskUseCase,
        testCase.body,
      );
      assert.deepStrictEqual(apiResponse, testCase.expectedApiResponse);
      assert.strictEqual(createTaskUseCase.execute.mock.callCount(), 1);
      assert.deepStrictEqual(
        createTaskUseCase.execute.mock.calls[0].arguments,
        testCase.expectedCreateTaskUseCaseArguments,
      );
    }
  });

  it("should return a status code 201 and the created task with an ID", async () => {
    const createTaskUseCase = {};
    createTaskUseCase.execute = mock.fn(async (taskPOJO) => {
      return { id: 1, ...taskPOJO };
    });
    const taskController = new TaskController();
    const today = new Date().toISOString();
    const body = new TaskPOJO("task", true, today);
    const apiResponse = await taskController.createTask(
      createTaskUseCase,
      body,
    );
    assert.deepStrictEqual(
      apiResponse,
      new APIResponse(201, {
        id: 1,
        name: "task",
        completed: true,
        dueDate: today,
      }),
    );
    assert.strictEqual(createTaskUseCase.execute.mock.callCount(), 1);
    assert.deepStrictEqual(createTaskUseCase.execute.mock.calls[0].arguments, [
      body,
    ]);
  });

  it("should throw an error if any other error is emitted", async () => {
    const createTaskUseCase = {};
    createTaskUseCase.execute = mock.fn(async (_) => {
      throw new Error("unexpected error!");
    });
    const taskController = new TaskController();
    const body = { name: "task" };
    const apiResponse = await taskController.createTask(
      createTaskUseCase,
      body,
    );
    assert.deepStrictEqual(apiResponse, APIResponse.internalServerError());
  });
});

describe("Testing deleteTask method", () => {
  it("should return the appropriate status and responde body given an input", async () => {
    const testCases = [
      {
        taskID: Number.MAX_SAFE_INTEGER,
        mockReturnValue: null,
        expected: new APIResponse(400, {
          message: `Task with ID ${Number.MAX_SAFE_INTEGER} doesn't exist`,
        }),
      },
      {
        taskID: 1,
        mockReturnValue: new TaskDTO("task", false, null),
        expected: new APIResponse(204),
      },
    ];

    for (const testCase of testCases) {
      const deleteTaskUseCase = {};
      deleteTaskUseCase.execute = mock.fn(
        async (_) => testCase.mockReturnValue,
      );
      const taskController = new TaskController();
      const apiResponse = await taskController.deleteTask(
        deleteTaskUseCase,
        testCase.taskID,
      );
      assert.deepStrictEqual(apiResponse, testCase.expected);
      assert.strictEqual(deleteTaskUseCase.execute.mock.callCount(), 1);
      assert.deepStrictEqual(
        deleteTaskUseCase.execute.mock.calls[0].arguments,
        [testCase.taskID],
      );
    }
  });

  it("should return an internal server error response if use case raises an error", async () => {
    const deleteTaskUseCase = {};
    deleteTaskUseCase.execute = mock.fn(async (_) => {
      throw new Error("error!");
    });
    const taskController = new TaskController();
    const apiResponse = await taskController.deleteTask(deleteTaskUseCase, 1);
    assert.deepStrictEqual(apiResponse, APIResponse.internalServerError());
    assert.strictEqual(deleteTaskUseCase.execute.mock.callCount(), 1);
  });
});

describe("Testing updateTask method", () => {
  it("should return the apropriate responde body given an input", async () => {
    const testCases = [
      {
        name: "testing invalid taskID",
        taskID: Number.MAX_SAFE_INTEGER,
        body: { name: "task" },
        mockReturnValue: null,
        expectedAPIResponse: new APIResponse(400, {
          message: `Task with ID ${Number.MAX_SAFE_INTEGER} doesn't exist`,
        }),
        expectedMockCallCount: 1,
        expectedMockCallArguments: [
          Number.MAX_SAFE_INTEGER,
          new TaskPOJO("task", undefined, undefined),
        ],
      },
      {
        name: "testing task updating",
        taskID: 1,
        body: { name: "task" },
        mockReturnValue: new TaskDTO("task", false, null, 1),
        expectedAPIResponse: new APIResponse(
          200,
          new TaskDTO("task", false, null, 1),
        ),
        expectedMockCallCount: 1,
        expectedMockCallArguments: [
          1,
          new TaskPOJO("task", undefined, undefined),
        ],
      },
    ];

    for (const testCase of testCases) {
      const updateTaskUseCase = {};
      updateTaskUseCase.execute = mock.fn(
        async (_, __) => testCase.mockReturnValue,
      );
      const taskController = new TaskController();
      const apiResponse = await taskController.updateTask(
        updateTaskUseCase,
        testCase.taskID,
        testCase.body,
      );
      assert.deepStrictEqual(
        apiResponse,
        testCase.expectedAPIResponse,
        testCase.name,
      );
      assert.strictEqual(
        updateTaskUseCase.execute.mock.callCount(),
        testCase.expectedMockCallCount,
        testCase.name,
      );
      if (testCase.expectedMockCallCount > 0) {
        assert.deepStrictEqual(
          updateTaskUseCase.execute.mock.calls[0].arguments,
          testCase.expectedMockCallArguments,
          testCase.name,
        );
      }
    }
  });

  it("should return a status 400 if any TaskEntityError is raised", async () => {
    const updateTaskUseCase = {};
    updateTaskUseCase.execute = mock.fn(async (_, __) => {
      throw new TaskEntityError("invalid field");
    });
    const taskController = new TaskController();
    const apiResponse = await taskController.updateTask(updateTaskUseCase, 1, {
      name: "task",
      completed: false,
    });
    assert.deepStrictEqual(
      apiResponse,
      new APIResponse(400, {
        message: "invalid field",
      }),
    );
    assert.strictEqual(updateTaskUseCase.execute.mock.callCount(), 1);
    assert.deepStrictEqual(updateTaskUseCase.execute.mock.calls[0].arguments, [
      1,
      new TaskPOJO("task", false, undefined),
    ]);
  });

  it("should return a status 400 with the provided error message if any use case error is raised", async () => {
    const updateTaskUseCase = {};
    updateTaskUseCase.execute = mock.fn(async (_, __) => {
      throw new UseCaseError("error");
    });
    const taskController = new TaskController();
    const apiResponse = await taskController.updateTask(updateTaskUseCase, 1, {
      name: "task",
      completed: false,
    });
    assert.deepStrictEqual(
      apiResponse,
      new APIResponse(400, {
        message: "error",
      }),
    );
    assert.strictEqual(updateTaskUseCase.execute.mock.callCount(), 1);
    assert.deepStrictEqual(updateTaskUseCase.execute.mock.calls[0].arguments, [
      1,
      new TaskPOJO("task", false, undefined),
    ]);
  });

  it("should return a status 500", async () => {
    const updateTaskUseCase = {};
    updateTaskUseCase.execute = mock.fn(async (_, __) => {
      throw new Error("error");
    });
    const taskController = new TaskController();
    const body = { name: "task" };
    const apiResponse = await taskController.updateTask(
      updateTaskUseCase,
      1,
      body,
    );
    assert.deepStrictEqual(apiResponse, APIResponse.internalServerError());
    assert.strictEqual(updateTaskUseCase.execute.mock.callCount(), 1);
    assert.deepStrictEqual(updateTaskUseCase.execute.mock.calls[0].arguments, [
      1,
      new TaskPOJO("task", undefined, undefined),
    ]);
  });
});

describe("Testing listTasks method", () => {
  it("should return a status 400 if invalid filter options", async () => {
    const listTaskUseCase = {};
    listTaskUseCase.execute = mock.fn(async (_) => {});
    const controller = new TaskController();
    const apiResponse = await controller.listTasks(listTaskUseCase, {
      filter: "asdf",
    });
    assert.deepStrictEqual(
      apiResponse,
      new APIResponse(400, { message: "Invalid column 'asdf'" }),
    );
    assert.strictEqual(listTaskUseCase.execute.mock.callCount(), 0);
  });
  it("should return status 500", async () => {
    const listTasksUseCase = {};
    listTasksUseCase.execute = mock.fn(async (_) => {
      throw new Error("error!!!");
    });
    const controller = new TaskController();
    const apiResponse = await controller.listTasks(listTasksUseCase, {});
    assert.deepStrictEqual(apiResponse, APIResponse.internalServerError());
    assert.strictEqual(listTasksUseCase.execute.mock.callCount(), 1);
  });
  it("should correctly call the useCase listTask method with the appropriated filters", async () => {
    const listTasksUseCase = {};
    listTasksUseCase.execute = mock.fn(async (_) => []);
    const taskController = new TaskController();
    const filterParams = {
      order: "name;dueDate,DESC",
      filter: "completed,true",
    };
    const apiResponse = await taskController.listTasks(
      listTasksUseCase,
      filterParams,
    );
    assert.deepStrictEqual(apiResponse, new APIResponse(200, []));
    assert.strictEqual(listTasksUseCase.execute.mock.callCount(), 1);
    assert.deepStrictEqual(listTasksUseCase.execute.mock.calls[0].arguments, [
      new TaskFilterOptions(filterParams),
    ]);
  });
});
