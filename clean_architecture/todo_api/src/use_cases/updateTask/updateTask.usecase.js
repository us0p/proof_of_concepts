const ITaskRepository = require("../../entities/interfaces/task.repository");
const TaskDTO = require("../interfaces/task.dto");
const UseCaseError = require("../useCase.error");

module.exports = class UpdateTaskUseCase {
  /**
   * @param {ITaskRepository} repo
   */
  constructor(repo) {
    this.repo = repo;
  }

  /**
   * @param {number} id
   * @param {TaskDTO} newTask
   * @returns {Promise<?TaskDTO>}
   */
  async execute(id, newTask) {
    if (newTask.name) {
      const duplicatedTaskName = await this.repo.getTaskByName(newTask.name);
      if (duplicatedTaskName && duplicatedTaskName.id !== id)
        throw new UseCaseError(
          `Task with name '${newTask.name}' already existis`,
        );
    }

    if (newTask.dueDate) {
      const duplicatedDueDate = await this.repo.getTaskByDueDate(
        newTask.dueDate,
      );
      if (duplicatedDueDate && duplicatedDueDate.id !== id)
        throw new UseCaseError(
          `Due date ${new Date(newTask.dueDate).toLocaleString()} already exists.`,
        );
    }

    const task = await this.repo.updateTask(id, newTask);
    return task ? TaskDTO.fromEntity(task) : null;
  }
};
