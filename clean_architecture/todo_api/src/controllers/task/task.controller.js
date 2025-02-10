const TaskEntity = require("../../entities/taskEntity");
const TaskUseCaseError = require("../../use_cases/task_use_case_error");
const TaskUseCases = require("../../use_cases/task_use_cases");

/**
 * @typedef {Object} APIResonse
 * @property {number} statusCode
 * @property {*} data
 */

module.exports = class TaskController {
  /**
   * @param {TaskUseCases} taskUseCases
   */
  constructor(taskUseCases) {
    this.taskUseCases = taskUseCases;
  }

  /**
   * @param {import("../../entities/taskEntity").TaskPOJO} body
   * @returns {Promise<APIResonse>}
   */
  async createTask(body) {
    const task = new TaskEntity(body.name, body.completed, body.dueDate);

    if (!task.isDueDateValid()) {
      return {
        statusCode: 400,
        data: {
          message: `due date '${body.dueDate}' is invalid`,
        },
      };
    }
    try {
      const taskWithID = await this.taskUseCases.createTask(
        task.getPublicData(),
      );

      return {
        statusCode: 201,
        data: taskWithID,
      };
    } catch (e) {
      if (!(e instanceof TaskUseCaseError)) throw new Error(e.message);

      return {
        statusCode: 400,
        data: {
          message: e.message,
        },
      };
    }
  }
};
