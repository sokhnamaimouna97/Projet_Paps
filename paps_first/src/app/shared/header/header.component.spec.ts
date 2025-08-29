import { ComponentFixture, TestBed } from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router'
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  const fakeActivatedRoute = {
      snapshot: { data: {  } }
    } as ActivatedRoute;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [{provide: ActivatedRoute, useValue: fakeActivatedRoute}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
