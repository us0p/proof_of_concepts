const TaskEntity = require("../entities/taskEntity");
const TaskUseCaseError = require("./task_use_case_error");

/**
 * @typedef {Object} TaskWithID
 * @property {number} id
 */

/**
 * @typedef {import("../entities/taskEntity").TaskDTO & TaskWithID} TaskWithIDDTO
 */

module.exports = class TaskUseCases {
  /**
   * @param {*} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * @param {TaskEntity} task - should refer to an interface to adere to
   * the SOLID dependency inversion principle
   * @returns {Promise<TaskWithIDDTO>}
   */
  async createTask(task) {
    const duplicatedTaskName = await this.db.getTaskByName(task.name);
    if (duplicatedTaskName)
      throw new TaskUseCaseError(`Duplicated task name '${task.name}'`);

    const duplicatedDueDate = await this.db.getTaskByDueDate(task.dueDate);
    if (duplicatedDueDate)
      throw new TaskUseCaseError("Cannot schedule two tasks for the same time");

    return await this.db.createTask(task.getDTO());
  }

  /**
   * @param {number} taskID
   * @returns {Promise<TaskWithIDDTO>}
   */
  async deleteTask(taskID) {
    return this.db.deleteTask(taskID);
  }

  /**
   * @param {*} filterOptions
   * @returns {Promise<TaskWithIDDTO[]>}
   */
  async listTasks(filterOptions) {
    return await this.db.listTasks(filterOptions);
  }
};
