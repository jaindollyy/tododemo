var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<TodoStore>();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler();

var todos = app.MapGroup("/api/todos");

todos.MapGet("/", (TodoStore store) =>
    Results.Ok(store.GetAll()));

todos.MapPost("/", (CreateTodoRequest request, TodoStore store) =>
{
    var title = request.Title?.Trim();

    if (string.IsNullOrWhiteSpace(title) || title.Length > 200)
    {
        return Results.ValidationProblem(
            new Dictionary<string, string[]>
            {
                ["title"] = ["Enter a title between 1 and 200 characters."]
            });
    }

    var item = store.Add(title);
    return Results.Created($"/api/todos/{item.Id}", item);
});

todos.MapGet("/{id:guid}", (Guid id, TodoStore store) =>
{
    var item = store.GetAll().FirstOrDefault(item => item.Id == id);
    return item is null ? Results.NotFound() : Results.Ok(item);
});

todos.MapDelete("/{id:guid}", (Guid id, TodoStore store) =>
    store.Delete(id) ? Results.NoContent() : Results.NotFound());

app.Run();

public sealed record CreateTodoRequest(string? Title);
public partial class Program { }