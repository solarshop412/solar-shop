import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { State } from '../../../reducers';
import { HomeComponent } from "../../../features/home/home.component";

@Component({
  selector: 'page-layout',
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, HomeComponent],
})
export class PageLayoutComponent implements OnInit, OnDestroy {
  title = 'Purchase Panda';
  opened$!: Observable<boolean>;
  contentMargin = 255;
  private destroy$ = new Subject<void>();

  constructor(private store: Store<State>) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
