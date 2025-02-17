const TaskEntity = require("../taskEntity");

/**
 * @typedef {Object} OrderBy
 * @property {string} column
 * @property {boolean=} decreasing
 */

/**
 * @typedef {Object} Range
 * @property {string} from
 * @property {string} to
 */

/**
 * @typedef {Object} FilterBy
 * @property {string} column
 * @property {string|boolean|Range} value
 */

/**
 * @typedef {Object} FilterOptions
 * @property {OrderBy[]=} orderBy
 * @property {FilterBy=} filter
 */

module.exports = class ITaskRepository {
  /**
   * @param {TaskEntity} task
   * @returns {Promise<TaskEntity>}
   */
  async createTask(task) {
    throw new Error("must implement");
  }

  /**
   * @param {string} name
   * @returns {Promise<?TaskEntity>}
   */
  async getTaskByName(name) {
    throw new Error("must implement");
  }

  /**
   * @param {string} dueDate
   * @returns {Promise<?TaskEntity>}
   */
  async getTaskByDueDate(dueDate) {
    throw new Error("must implement");
  }

  /**
   * @param {number} taskID
   * @return {Promise<?TaskEntity>}
   */
  async deleteTask(taskID) {
    throw new Error("must implement");
  }

  /**
   * @param {FilterOptions} filterOptions
   * @returns {Promise<TaskEntity[]>}
   */
  async listTasks(filterOptions) {
    throw new Error("must implement");
  }

  /**
   * @param {number} id
   * @param {TaskEntity} newTask
   * @returns {Promise<?TaskEntity>}
   */
  async updateTask(id, newTask) {
    throw new Error("must implement");
  }
};
