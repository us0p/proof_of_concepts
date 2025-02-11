const TaskEntity = require("../../entities/taskEntity");
const TaskUseCaseError = require("../../use_cases/task_use_case_error");
const TaskUseCases = require("../../use_cases/task_use_cases");

/**
 * @typedef {Object} APIResponse
 * @property {number} statusCode
 * @property {*} data
 */

/**
 * @typedef {Object} FilterParams
 * @property {string} [filter = undefined]
 * @property {string} [order = undefined]
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
   * @returns {Promise<APIResponse>}
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

  /**
   * @param {number} taskID
   * @returns {Promise<APIResponse>}
   */
  async deleteTask(taskID) {
    const task = await this.taskUseCases.deleteTask(taskID);
    if (!task)
      return {
        statusCode: 400,
        data: {
          message: `Task with ID ${taskID} doesn't exist`,
        },
      };

    return {
      statusCode: 204,
      data: undefined,
    };
  }

  /**
   * @param {number} taskID
   * @param {import("../../entities/taskEntity").TaskPOJO} body
   */
  async updateTask(taskID, body) {
    const taskEntity = new TaskEntity(body.name, body.completed, body.dueDate);
    if (!taskEntity.isDueDateValid())
      return {
        statusCode: 400,
        data: {
          message: `Due date '${body.dueDate}' is invalid`,
        },
      };

    try {
      const newTask = await this.taskUseCases.updateTask(
        taskID,
        taskEntity.getPublicData(),
      );
      if (!newTask)
        return {
          statusCode: 400,
          data: { message: `Task with ID ${taskID} doesn't exist` },
        };
      return {
        statusCode: 200,
        data: newTask,
      };
    } catch (e) {
      if (!(e instanceof TaskUseCaseError))
        return {
          statusCode: 500,
          data: { message: "Internal Server Error" },
        };

      return {
        statusCode: 400,
        data: { message: e.message },
      };
    }
  }

  /**
   * @param {FilterParams} filterParams
   * @returns {Proimse<APIResponse>}
   */
  async listTasks(filterParams) {
    /** @type {import("../../use_cases/task_use_cases").FilterOptions} */
    const filterOptions = {};
    if (filterParams.order) {
      const ordering = filterParams.order.split(";");
      filterOptions.orderBy = ordering.map((order) => {
        const [column, ordering] = order.split(",");
        const orderBy = { column };
        if (ordering?.toUpperCase() === "DESC") orderBy.decreasing = true;
        return orderBy;
      });
    }

    if (filterParams.filter) {
      filterOptions.filter = {};
      const [column, value] = filterParams.filter.split("=");
      switch (column.toLowerCase()) {
        case "name": {
          filterOptions.filter.column = "name";
          filterOptions.filter.value = value;
          break;
        }
        case "completed": {
          if (value !== "true" && value !== "false") {
            return {
              statusCode: 400,
              data: { message: "Completed column filter must be a boolean" },
            };
          }
          filterOptions.filter.column = "completed";
          filterOptions.filter.value = value === "true" ? true : false;
          break;
        }
        case "duedate": {
          const [start, end] = value.split(";");
          const startDate = new Date(start);
          const endDate = new Date(end);
          if (
            startDate.toString() === "Invalid Date" ||
            endDate.toString() === "Invalid Date"
          )
            return {
              statusCode: 400,
              data: {
                message: `date range '${value}' isn't a valid range`,
              },
            };

          if (endDate < startDate)
            return {
              statusCode: 400,
              data: {
                message: "end date can't be before start date.",
              },
            };
          filterOptions.filter.column = "dueDate";
          filterOptions.filter.value = {
            from: startDate.toISOString(),
            to: endDate.toISOString(),
          };
          break;
        }
        default: {
          return {
            statusCode: 400,
            data: { message: `invalid column '${column}'` },
          };
        }
      }
    }
    const tasks = await this.taskUseCases.listTasks(filterOptions);
    return {
      statusCode: 200,
      data: tasks,
    };
  }
};
