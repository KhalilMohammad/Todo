using TodoBackend.Models;

public class AddTodoInput
{
    public string Title { get; set; }
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public Priority Priority { get; set; } = Priority.Medium;
    public bool IsCompleted { get; set; } = false;
}