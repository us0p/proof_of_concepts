const ITaskRepository = require("../../entities/interfaces/task.repository");
const UseCaseError = require("../useCase.error");
const TaskDTO = require("../interfaces/task.dto");

module.exports = class CreateTaskUseCase {
  /**
   * @param {ITaskRepository} repo
   */
  constructor(repo) {
    this.repo = repo;
  }

  /**
   * @param {TaskDTO} task
   * @returns {Promise<TaskDTO>}
   */
  async execute(task) {
    const duplicatedTaskName = await this.repo.getTaskByName(task.name);
    if (duplicatedTaskName)
      throw new UseCaseError(`Duplicated task name '${task.name}'`);

    const duplicatedDueDate = await this.repo.getTaskByDueDate(task.dueDate);
    if (duplicatedDueDate)
      throw new UseCaseError("Cannot schedule two tasks for the same time");

    return TaskDTO.fromEntity(await this.repo.createTask(task));
  }
};
