const ITaskRepository = require("../../entities/interfaces/task.repository");
const UseCaseError = require("../useCase.error");
const TaskDTO = require("../interfaces/task.dto");
const TaskPOJO = require("../../entities/taskPOJO");
const TaskEntity = require("../../entities/taskEntity");

module.exports = class CreateTaskUseCase {
  /**
   * @param {ITaskRepository} repo
   */
  constructor(repo) {
    this.repo = repo;
  }

  /**
   * @param {TaskPOJO} task
   * @returns {Promise<TaskDTO>}
   */
  async execute(task) {
    const taskEntity = new TaskEntity(task.name, task.completed, task.dueDate);
    taskEntity.validate();

    const duplicatedTaskName = await this.repo.getTaskByName(taskEntity.name);
    if (duplicatedTaskName)
      throw new UseCaseError(`Duplicated task name '${taskEntity.name}'`);

    const duplicatedDueDate = await this.repo.getTaskByDueDate(
      taskEntity.dueDate,
    );
    if (duplicatedDueDate)
      throw new UseCaseError("Cannot schedule two tasks for the same time");

    return TaskDTO.fromEntity(await this.repo.createTask(taskEntity));
  }
};
