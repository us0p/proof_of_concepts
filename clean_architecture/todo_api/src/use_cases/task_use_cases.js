const TaskEntity = require("../entities/taskEntity");
const TaskUseCaseError = require("./task_use_case_error");

/**
 * @typedef {Object} TaskWithID
 * @property {number} id
 */

/**
 * @typedef {import("../entities/taskEntity").TaskPOJO & TaskWithID} TaskWithIDPOJO
 */

module.exports = class TaskUseCases {
  /**
   * @param {*} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * @param {import("../entities/taskEntity").TaskPOJO} task
   * @returns {Promise<TaskWithIDPOJO>}
   */
  async createTask(task) {
    const duplicatedTaskName = await this.db.getTaskByName(task.name);
    if (duplicatedTaskName)
      throw new TaskUseCaseError(`Duplicated task name '${task.name}'`);

    const duplicatedDueDate = await this.db.getTaskByDueDate(task.dueDate);
    if (duplicatedDueDate)
      throw new TaskUseCaseError("Cannot schedule two tasks for the same time");

    return await this.db.createTask(task);
  }

  /**
   * @param {number} taskID
   * @returns {Promise<TaskWithIDPOJO>}
   */
  async deleteTask(taskID) {
    return this.db.deleteTask(taskID);
  }

  /**
   * @param {*} filterOptions
   * @returns {Promise<TaskWithIDPOJO[]>}
   */
  async listTasks(filterOptions) {
    return await this.db.listTasks(filterOptions);
  }

  /**
   * @param {number} id
   * @param {import("../entities/taskEntity").TaskDTO} newTask
   * @returns {Promise<TaskWithIDPOJO>}
   */
  async updateTask(id, newTask) {
    if (newTask.name) {
      const duplicatedTaskName = await this.db.getTaskByName(newTask.name);
      if (duplicatedTaskName && duplicatedTaskName.id !== id)
        throw new TaskUseCaseError(
          `Task with name '${newTask.name}' already existis`,
        );
    }

    if (newTask.dueDate) {
      const duplicatedDueDate = await this.db.getTaskByDueDate(newTask.dueDate);
      if (duplicatedDueDate && duplicatedDueDate.id !== id)
        throw new TaskUseCaseError(
          `Due date ${new Date(newTask.dueDate).toLocaleString()} already exists.`,
        );
    }

    return this.db.updateTask(id, newTask);
  }
};
