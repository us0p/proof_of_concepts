const TaskEntity = require("../../entities/taskEntity");

module.exports = class TaskDTO {
  /**
   * @param {number} id
   * @param {string} name
   * @param {boolean} completed
   * @param {?string} dueDate
   */
  constructor(id, name, completed, dueDate) {
    this.id = id;
    this.name = name;
    this.completed = completed;
    this.dueDate = dueDate ? new Date(dueDate).toISOString() : null;
  }

  /**
   * @param {TaskEntity} entity
   * @returns {TaskDTO}
   */
  static fromEntity(entity) {
    return new TaskDTO(
      entity.id,
      entity.name,
      entity.completed,
      entity.dueDate,
    );
  }
};
