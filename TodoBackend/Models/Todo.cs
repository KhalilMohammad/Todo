using System.ComponentModel.DataAnnotations;

namespace TodoBackend.Models
{
    public class Todo
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        public string Description { get; set; }
        public bool IsCompleted { get; set; } = false;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public Priority Priority { get; set; } = Priority.Medium;
    }

    public enum Priority
    {
        Low = 0,
        Medium = 1,
        High = 2
    }
}
