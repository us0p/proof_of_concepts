const ITaskRepository = require("../../entities/interfaces/task.repository");
const TaskEntity = require("../../entities/taskEntity");
const TaskPOJO = require("../../entities/taskPOJO");
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
   * @param {TaskPOJO} newTask
   * @returns {Promise<?TaskDTO>}
   */
  async execute(id, newTask) {
    const newTaskEntity = new TaskEntity(
      newTask.name,
      newTask.completed,
      newTask.dueDate,
    );
    newTaskEntity.validate();

    if (newTaskEntity.name) {
      const duplicatedTaskName = await this.repo.getTaskByName(
        newTaskEntity.name,
      );
      if (duplicatedTaskName && duplicatedTaskName.id !== id)
        throw new UseCaseError(
          `Task with name '${newTaskEntity.name}' already existis`,
        );
    }

    if (newTaskEntity.dueDate) {
      const duplicatedDueDate = await this.repo.getTaskByDueDate(
        newTaskEntity.dueDate,
      );
      if (duplicatedDueDate && duplicatedDueDate.id !== id)
        throw new UseCaseError(
          `Due date ${new Date(newTaskEntity.dueDate).toLocaleString()} already exists.`,
        );
    }

    const task = await this.repo.updateTask(id, newTaskEntity);
    return task ? TaskDTO.fromEntity(task) : null;
  }
};
