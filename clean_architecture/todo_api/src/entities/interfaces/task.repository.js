const TaskEntity = require("../taskEntity");
const TaskFilterOptions = require("../taskFilter");

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
   * @param {TaskFilterOptions} filterOptions
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
