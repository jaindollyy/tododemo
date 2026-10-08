import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface TodoItem {
  id: string;
  title: string;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/todos';

  getAll() {
    return this.http.get<TodoItem[]>(this.url);
  }

  add(title: string) {
    return this.http.post<TodoItem>(this.url, { title });
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}