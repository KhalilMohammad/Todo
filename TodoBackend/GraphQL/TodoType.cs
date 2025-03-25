using TodoBackend.Models;

namespace TodoBackend.GraphQL
{
    public class TodoType : ObjectType<Todo>
    {
        protected override void Configure(IObjectTypeDescriptor<Todo> descriptor)
        {
            descriptor.Description("Represents a Todo item");

            descriptor.Field(t => t.Id)
                .Description("The unique identifier for the Todo");

            descriptor.Field(t => t.Title)
                .Description("The title of the Todo");

            descriptor.Field(t => t.Description)
                .Description("The detailed description of the Todo");

            descriptor.Field(t => t.IsCompleted)
                .Description("Indicates whether the Todo is completed");

            descriptor.Field(t => t.CreatedAt)
                .Description("The date and time when the Todo was created");

            descriptor.Field(t => t.UpdatedAt)
                .Description("The date and time when the Todo was last updated");

            descriptor.Field(t => t.DueDate)
                .Description("The optional deadline for the Todo");

            descriptor.Field(t => t.Priority)
                .Description("The priority level of the Todo");
        }
    }
}
