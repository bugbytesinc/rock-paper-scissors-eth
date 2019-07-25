import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayStatusComponent } from './play-status.component';

describe('PlayStatusComponent', () => {
  let component: PlayStatusComponent;
  let fixture: ComponentFixture<PlayStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
