const { BehaviorSubject, switchMap, shareReplay, take, of, forkJoin, catchError } = require('rxjs');

const trigger$ = new BehaviorSubject(undefined);
const obs1 = trigger$.pipe(
  switchMap(() => {
    return new Promise(resolve => setTimeout(() => resolve(['location1']), 500));
  }),
  shareReplay(1)
);

const obs2 = trigger$.pipe(
  switchMap(() => {
    return new Promise(resolve => setTimeout(() => resolve(['vendor1']), 500));
  }),
  shareReplay(1)
);

console.log('starting forkjoin');
forkJoin({
  l: obs1.pipe(take(1), catchError(() => of([]))),
  v: obs2.pipe(take(1), catchError(() => of([])))
}).subscribe({
  next: (res) => console.log('forkjoin finished', res),
  error: (err) => console.log('forkjoin error', err)
});
