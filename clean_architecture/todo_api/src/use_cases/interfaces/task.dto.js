const TaskEntity = require("../../entities/taskEntity");

module.exports = class TaskDTO {
  /**
   * @param {string} name
   * @param {boolean} completed
   * @param {?string} dueDate
   * @param {number} [id]
   */
  constructor(name, completed, dueDate, id) {
    this.name = name;
    this.completed = completed;
    this.dueDate = dueDate ? new Date(dueDate).toISOString() : null;
    if (id) {
      this.id = id;
    }
  }

  /**
   * @param {TaskEntity} entity
   * @returns {TaskDTO}
   */
  static fromEntity(entity) {
    return new TaskDTO(
      entity.name,
      entity.completed,
      entity.dueDate,
      entity.id,
    );
  }
};
