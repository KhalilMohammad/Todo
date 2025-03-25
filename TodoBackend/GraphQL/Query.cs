using Microsoft.EntityFrameworkCore;
using TodoBackend.Data;
using TodoBackend.Models;

namespace TodoBackend.GraphQL
{
    public class Query
    {
        [UsePaging]
        [UseProjection]
        [UseFiltering]
        [UseSorting]
        public async Task<IQueryable<Todo>> GetTodos([Service] IDbContextFactory<TodoDbContext> dbFactory)
        {
            var context = await dbFactory.CreateDbContextAsync();
            return context.Todos.AsNoTracking();
        }
        public async Task<Todo?> GetTodo([Service] IDbContextFactory<TodoDbContext> dbFactory, int id)
        {
            await using var context = await dbFactory.CreateDbContextAsync();
            return await context.Todos.FindAsync(id);
        }
    }
}
