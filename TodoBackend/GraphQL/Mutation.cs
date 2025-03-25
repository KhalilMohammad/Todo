using TodoBackend.Data;
using TodoBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace TodoBackend.GraphQL
{
    public class Mutation
    {
        public async Task<Todo> AddTodoAsync(
            [Service] IDbContextFactory<TodoDbContext> dbFactory,
            AddTodoInput input)
        {
            await using var context = await dbFactory.CreateDbContextAsync();

            var now = DateTime.UtcNow;
            var todo = new Todo
            {
                Title = input.Title,
                Description = input.Description,
                DueDate = input.DueDate,
                Priority = input.Priority,
                IsCompleted = false,
                CreatedAt = now,
                UpdatedAt = now
            };

            context.Todos.Add(todo);
            await context.SaveChangesAsync();
            return todo;
        }

        public async Task<Todo> UpdateTodoAsync(
            [Service] IDbContextFactory<TodoDbContext> dbFactory,
            UpdateTodoInput input)
        {
            await using var context = await dbFactory.CreateDbContextAsync();

            var todo = await context.Todos.FindAsync(input.Id);

            if (todo == null)
            {
                throw new Exception($"Todo with ID {input.Id} not found");
            }

            if (input.Title is not null)
                todo.Title = input.Title;

            if (input.Description is not null)
                todo.Description = input.Description;

            if (input.IsCompleted.HasValue)
                todo.IsCompleted = input.IsCompleted.Value;

            if (input.DueDate.HasValue)
                todo.DueDate = input.DueDate.Value;

            if (input.Priority.HasValue)
                todo.Priority = input.Priority.Value;

            todo.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return todo;
        }

        public async Task<Todo> CompleteTodoAsync(
            [Service] IDbContextFactory<TodoDbContext> dbFactory,
            int id)
        {
            await using var context = await dbFactory.CreateDbContextAsync();

            var todo = await context.Todos.FindAsync(id);

            if (todo == null)
            {
                throw new Exception($"Todo with ID {id} not found");
            }

            todo.IsCompleted = true;
            todo.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return todo;
        }

        public async Task<bool> DeleteTodoAsync(
            [Service] IDbContextFactory<TodoDbContext> dbFactory,
            int id)
        {
            await using var context = await dbFactory.CreateDbContextAsync();

            var todo = await context.Todos.FindAsync(id);

            if (todo == null)
            {
                return false;
            }

            context.Todos.Remove(todo);
            await context.SaveChangesAsync();

            return true;
        }
    }
}
