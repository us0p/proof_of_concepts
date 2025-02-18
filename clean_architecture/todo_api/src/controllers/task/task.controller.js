const UseCaseError = require("../../use_cases/useCase.error");
const APIResponse = require("../../presenters/api/api_response.presenter");
const TaskEntityError = require("../../entities/taskEntity.error");

const CreateTaskUseCase = require("../../use_cases/createTask/createTask.usecase");
const DeleteTaskUseCase = require("../../use_cases/deleteTask/deleteTask.usecase");
const UpdateTaskUseCase = require("../../use_cases/updateTask/updateTask.usecase");
const ListTasksUseCase = require("../../use_cases/listTasks/listTask.usecase");
const TaskFilterOptions = require("../../entities/taskFilter");
const TaskFilterOptionError = require("../../entities/taskFilter.error");
const TaskPOJO = require("../../entities/taskPOJO");

module.exports = class TaskController {
  /**
   * @param {CreateTaskUseCase} createTaskUseCase
   * @param {TaskPOJO} body
   * @returns {Promise<APIResponse>}
   */
  async createTask(createTaskUseCase, body) {
    try {
      const taskPojo = new TaskPOJO(body.name, body.completed, body.dueDate);
      const taskDTOWithID = await createTaskUseCase.execute(taskPojo);

      return new APIResponse(201, taskDTOWithID);
    } catch (e) {
      if (!(e instanceof UseCaseError) && !(e instanceof TaskEntityError))
        return APIResponse.internalServerError();

      return new APIResponse(400, { message: e.message });
    }
  }

  /**
   * @param {DeleteTaskUseCase} deleteTaskUseCase
   * @param {number} taskID
   * @returns {Promise<APIResponse>}
   */
  async deleteTask(deleteTaskUseCase, taskID) {
    try {
      const task = await deleteTaskUseCase.execute(taskID);
      if (!task)
        return new APIResponse(400, {
          message: `Task with ID ${taskID} doesn't exist`,
        });

      return new APIResponse(204);
    } catch (_) {
      return APIResponse.internalServerError();
    }
  }

  /**
   * @param {UpdateTaskUseCase} updateTaskUseCase
   * @param {number} taskID
   * @param {TaskPOJO} body
   * @returns {Promise<APIResponse>}
   */
  async updateTask(updateTaskUseCase, taskID, body) {
    try {
      const taskPOJO = new TaskPOJO(body.name, body.completed, body.dueDate);
      const newTask = await updateTaskUseCase.execute(taskID, taskPOJO);
      if (!newTask)
        return new APIResponse(400, {
          message: `Task with ID ${taskID} doesn't exist`,
        });

      return new APIResponse(200, newTask);
    } catch (e) {
      if (!(e instanceof UseCaseError) && !(e instanceof TaskEntityError))
        return APIResponse.internalServerError();

      return new APIResponse(400, { message: e.message });
    }
  }

  /**
   * @param {ListTasksUseCase} listTasksUseCase
   * @param {FilterParams} filterParams
   * @returns {Proimse<APIResponse>}
   */
  async listTasks(listTasksUseCase, filterParams) {
    try {
      const filterOptions = new TaskFilterOptions(filterParams);
      const tasks = await listTasksUseCase.execute(filterOptions);
      return new APIResponse(200, tasks);
    } catch (e) {
      if (!(e instanceof TaskFilterOptionError))
        return APIResponse.internalServerError();

      return new APIResponse(400, { message: e.message });
    }
  }
};
