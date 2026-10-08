import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { App } from './app';

describe('TODO app', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function setup() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    http.expectOne('/api/todos').flush([
      { id: '1', title: 'Buy milk' }
    ]);

    fixture.detectChanges();
    return fixture;
  }

  it('displays items returned by the API', () => {
    const fixture = setup();

    expect(fixture.nativeElement.textContent).toContain('Buy milk');
  });

  it('adds a trimmed title and clears the input', async () => {
  const fixture = setup();
  await fixture.whenStable();

  const input: HTMLInputElement =
    fixture.nativeElement.querySelector('input');

  input.value = '  Read a book  ';
  input.dispatchEvent(new Event('input', { bubbles: true }));

  await fixture.whenStable();
  fixture.detectChanges();

  fixture.nativeElement.querySelector('form')
    .dispatchEvent(new Event('submit', {
      bubbles: true,
      cancelable: true
    }));

  const request = http.expectOne('/api/todos');
  expect(request.request.method).toBe('POST');
  expect(request.request.body).toEqual({ title: 'Read a book' });

  request.flush({ id: '2', title: 'Read a book' });

  await fixture.whenStable();
  fixture.detectChanges();

  expect(fixture.nativeElement.textContent).toContain('Read a book');
  expect(input.value).toBe('');
 });

  it('removes an item after a successful delete', () => {
    const fixture = setup();

    fixture.nativeElement.querySelector('li button').click();

    const request = http.expectOne('/api/todos/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Buy milk');
  });

  it('keeps an item and shows an error when delete fails', () => {
    const fixture = setup();

    fixture.nativeElement.querySelector('li button').click();

    http.expectOne('/api/todos/1').flush(
      {},
      { status: 500, statusText: 'Server error' }
    );

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Buy milk');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
      .toContain('Could not delete');
  });
});