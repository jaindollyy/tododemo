using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Todo.Api.Tests;

[TestClass]
public class TodoApiTests
{
    [TestMethod]
    public async Task CanAddListAndDeleteTodo()
    {
        await using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var initial = await client.GetFromJsonAsync<TodoItem[]>("/api/todos");

        Assert.IsNotNull(initial);
        Assert.AreEqual(0, initial.Length);

        // add an item
        var created = await client.PostAsJsonAsync(
            "/api/todos",
            new { title = "  Buy milk  " });

        // the item was created and its title was trimmed
        Assert.AreEqual(HttpStatusCode.Created, created.StatusCode);

        var item = await created.Content.ReadFromJsonAsync<TodoItem>();

        Assert.IsNotNull(item);
        Assert.AreEqual("Buy milk", item.Title);

        // Check that the list contains the item
        var list = await client.GetFromJsonAsync<TodoItem[]>("/api/todos");

        Assert.IsNotNull(list);
        Assert.AreEqual(1, list.Length);
        Assert.AreEqual(item.Id, list[0].Id);

        // Delete the item
        var deleted = await client.DeleteAsync($"/api/todos/{item.Id}");

        Assert.AreEqual(HttpStatusCode.NoContent, deleted.StatusCode);

        // Check that the list is empty again
        list = await client.GetFromJsonAsync<TodoItem[]>("/api/todos");

        Assert.IsNotNull(list);
        Assert.AreEqual(0, list.Length);

        var missing = await client.GetAsync($"/api/todos/{item.Id}");

        Assert.AreEqual(HttpStatusCode.NotFound, missing.StatusCode);
    }

    [TestMethod]
    [DataRow(null)]
    [DataRow("")]
    [DataRow("   ")]
    public async Task RejectsBlankTitle(string? title)
    {
        await using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

    
        var response = await client.PostAsJsonAsync(
            "/api/todos",
            new { title });

        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [TestMethod]
    public async Task RejectsTitleLongerThan200Characters()
    {

        await using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var title = new string('a', 201);

        var response = await client.PostAsJsonAsync(
            "/api/todos",
            new { title });

        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [TestMethod]
    public async Task DeletingMissingTodoReturnsNotFound()
    {
        await using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var missingId = Guid.NewGuid();

        var response = await client.DeleteAsync($"/api/todos/{missingId}");

        Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode);
    }
}