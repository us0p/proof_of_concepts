# Clean Architecture - Todo app
A simple CRUD application created with pure Node.js to study the basics of 
the clean architecture principles.

## Entities - Enterprise Business Rules
**TaskEntity**  
- properties
    - name
    - completed
    - dueDate?
- methods
    - validateDueDate: if provided, can't create task for date in the 
    past.

## Use Cases - Application Business Rules
**Create Task**  
- Create tasks with unique name and due dates.
**Mark Task as completed**  
- Update a task completed to true.
**Mark Task as todo**  
- Update a task completed to false.
**Delete Task**  
- Delete a given task.
**List Tasks**  
- List all tasks, can order by dueDate.

## Controllers, Gateways, Presenters - Interface Adapters
**Task controller**  
- POST /create/task
- PUT /update/task/:id
- DELETE /delete/task/:id
- GET /list/task

## DB, Devices, Web, UI, External Interfaces - Frameworks & Drivers
**SQLite**
- Models:
    - TaskModel
        - name
        - completed
        - dueDate
        - createdAt
        - updatedAt
        - deletedAt

## To clarify:
- Difference between Entities and Models
