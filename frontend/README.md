# TodoDemo

A small TODO list application using Angular 22, ASP.NET Core 10, and in-memory storage.

## Features

- View TODO items.
- Add a TODO with a title between 1 and 200 characters.
- Delete a TODO.
- Display loading, empty-list, and request-error states.
- Trim titles before saving.
- Prevent duplicate submissions while a request is pending.

## Prerequisites

- .NET 10 SDK.
- Node.js compatible with Angular 22 (developed using Node.js 24.15.0).
- npm (developed using npm 12.2.0).
- Angular CLI 22.2.2 was used to generate the frontend. No global CLI installation is required.

VS Code or a version of Visual Studio Community that supports .NET 10 can be used. Neither editor is required to run the application.

## Project structure

```text
tododemo/
  backend/
    Todo.Api/          ASP.NET Core API and in-memory store
    Todo.Api.Tests/    MSTest API integration tests
  frontend/           Angular application and component tests
  TodoDemo.slnx       Backend solution
  README.md
  .gitignore
```

## Run locally

Clone the repository and open a terminal in its root folder.

Start the backend:

```powershell
dotnet restore
dotnet run --project backend/Todo.Api --no-launch-profile --urls http://localhost:5000
```

Open a second terminal in the repository root and start the frontend:

```powershell
cd frontend
npm install
npm start
```

Open http://localhost:4200. The API is available at http://localhost:5000/api/todos.

The frontend start script uses `ng serve --proxy-config proxy.conf.json`. The development proxy forwards `/api/**` requests to `http://localhost:5000`. Keep both processes running. Press Ctrl+C in each terminal to stop them.

No database, migrations, environment secrets, global Angular CLI, or HTTPS certificate setup is required. These instructions use HTTP for local development.

## Tests and builds

From the repository root:

```powershell
dotnet test
dotnet build --configuration Release
```

From the frontend folder:

```powershell
npm test -- --watch=false
npm run build
```

Backend integration tests cover adding, listing, deleting, title trimming, rejection of null/empty/whitespace titles, rejection of titles over 200 characters, and deletion of a missing item. Each test starts an isolated API host and store.

Frontend component tests cover displaying items, adding a trimmed title and clearing the input, successful deletion, and retaining an item when deletion fails. HTTP responses are mocked in these tests.

## API

| Method | Route | Successful response | Other responses |
|---|---|---|---|
| GET | `/api/todos` | 200 with an array of items | — |
| GET | `/api/todos/{id}` | 200 with an item | 404 for a missing item |
| POST | `/api/todos` | 201 with the new item and Location header | 400 for an invalid title/body |
| DELETE | `/api/todos/{id}` | 204 with no response body | 404 for a missing item |

POST body:

```json
{ "title": "Buy milk" }
```

Example item:

```json
{ "id": "50732ae7-6b71-4319-8e77-5c156803c1ba", "title": "Buy milk" }
```

## Design

The Angular component manages presentation and UI state. A dedicated injectable service handles HTTP communication. A template-driven form is sufficient for the single title input.

The backend uses minimal API route handlers and a separate storage class registered as a singleton. The singleton keeps data across requests; a concurrent dictionary supports simultaneous requests. Items are immutable records. Backend validation is authoritative, with frontend validation for immediate feedback.

The API returns a sorted snapshot for list requests. New items are appended immediately in the frontend; reloading the page fetches the sorted list again.

## Limitations

- Data is lost when the API stops or restarts.
- All users of the running API share one list. There is no authentication or per-user storage.
- Multiple API processes would each have a separate list.
- Another browser's changes appear after reloading the page; there is no live synchronization.
- The proxy is a development setup. A production deployment needs its own API routing configuration.
- The supplied tests cover the main behaviours, rather than every possible error or concurrency scenario.

## Official references

- [Angular releases](https://angular.dev/reference/releases)
- [Angular version compatibility](https://angular.dev/reference/versions)
- [Angular template-driven forms](https://angular.dev/guide/forms/template-driven-forms)
- [Angular signals](https://angular.dev/guide/signals)
- [Angular HTTP client](https://angular.dev/guide/http)
- [Angular HTTP testing](https://angular.dev/guide/http/testing)
- [Angular development proxy](https://angular.dev/tools/cli/serve#proxying-to-a-backend-server)
- [ASP.NET Core minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-10.0)
- [ASP.NET Core integration tests](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0)
- [MSTest test attributes and assertions](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-mstest-writing-tests)
