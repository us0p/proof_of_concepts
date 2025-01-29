const TaskEntity = require("../entities/taskEntity");

module.exports = class CreateTaskUseCase {
  /**
   * @param {TaskEntity} task
   * @patam {*} db
   */
  constructor(task, db) {
    this.task = task;
    this.db = db;
  }
};
