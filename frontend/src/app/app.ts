import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { TodoItem, TodoService } from './todo.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly api = inject(TodoService);

  readonly todos = signal<TodoItem[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal<string[]>([]);
  readonly error = signal('');
  title = '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.error.set('');
    this.loading.set(true);

    this.api.getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: items => this.todos.set(items),
        error: () => this.error.set('Could not load your list. Please retry.')
      });
  }

  add() {
    const title = this.title.trim();

    if (!title || title.length > 200 || this.saving()) {
      return;
    }

    this.error.set('');
    this.saving.set(true);

    this.api.add(title)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: item => {
          this.todos.update(items => [...items, item]);
          this.title = '';
        },
        error: () => this.error.set('Could not add the item. Please retry.')
      });
  }

  delete(item: TodoItem) {
    if (this.deleting().includes(item.id)) {
      return;
    }

    this.error.set('');
    this.deleting.update(ids => [...ids, item.id]);

    this.api.delete(item.id)
      .pipe(finalize(() =>
        this.deleting.update(ids => ids.filter(id => id !== item.id))
      ))
      .subscribe({
        next: () => this.todos.update(
          items => items.filter(existing => existing.id !== item.id)
        ),
        error: () => this.error.set('Could not delete the item. Please retry.')
      });
  }
}