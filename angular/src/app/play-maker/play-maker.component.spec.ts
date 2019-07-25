import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayMakerComponent } from './play-maker.component';

describe('PlayMakerComponent', () => {
  let component: PlayMakerComponent;
  let fixture: ComponentFixture<PlayMakerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayMakerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
