import { ComponentFixture, TestBed } from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router'
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  const fakeActivatedRoute = {
      snapshot: { data: {  } }
    } as ActivatedRoute;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
        providers: [{provide: ActivatedRoute, useValue: fakeActivatedRoute}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
