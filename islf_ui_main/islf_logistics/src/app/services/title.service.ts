import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';



@Injectable({ providedIn: 'root' })
export class TitleService {
  constructor(private title: Title, private router: Router, private activatedRoute: ActivatedRoute,) {}

  init(defaultTitle: string = 'ISLF') {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute.firstChild;
        let child = route;
        while (child) {
          if (child.firstChild) {
            child = child.firstChild;
            route = child;
          } else {
            child = null;
          }
        }
        return route;
      }),
      mergeMap(route => route?.data ?? [])
    ).subscribe(data => {
      this.title.setTitle(data['title'] || defaultTitle);
    });
  }
} 