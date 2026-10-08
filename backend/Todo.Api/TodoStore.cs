using System.Collections.Concurrent;

public sealed record TodoItem(Guid Id, string Title);

public sealed class TodoStore
{
    private readonly ConcurrentDictionary<Guid, TodoItem> _items = new();

    public IReadOnlyList<TodoItem> GetAll() =>
        _items.Values
            .OrderBy(item => item.Title, StringComparer.OrdinalIgnoreCase)
            .ThenBy(item => item.Id)
            .ToArray();

    public TodoItem Add(string title)
    {
        var item = new TodoItem(Guid.NewGuid(), title.Trim());
        _items[item.Id] = item;
        return item;
    }

    public bool Delete(Guid id) => _items.TryRemove(id, out _);
}