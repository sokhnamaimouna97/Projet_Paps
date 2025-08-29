import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    localStorage.clear(); // Nettoyer avant chaque test
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login with correct credentials', () => {
    const result = service.login('admin', 'admin');
    expect(result).toBeTrue();
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should fail login with wrong credentials', () => {
    const result = service.login('user', 'wrong');
    expect(result).toBeFalse();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should logout correctly', () => {
    service.login('admin', 'admin');
    service.logout();
    expect(service.isLoggedIn()).toBeFalse();
  });
});
