import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserSession } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private currentUserSubject: BehaviorSubject<UserSession | null>;
  public currentUser: Observable<UserSession | null>;

  constructor() {
    const storedUser = sessionStorage.getItem('currentUser');
    let user: UserSession | null = null;

    if (storedUser) {
      user = JSON.parse(storedUser);
      if (user) {
        user.registrationTimestamp = new Date(user.registrationTimestamp);
        if (user.dateOfBirth) user.dateOfBirth = new Date(user.dateOfBirth);
        if (user.contractExpires)
          user.contractExpires = new Date(user.contractExpires);
      }
    }
    this.currentUserSubject = new BehaviorSubject<UserSession | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserSession | null {
    return this.currentUserSubject.value;
  }

  login(user: UserSession) {
    const userToStore = JSON.stringify(user, (key, value) => {
      if (typeof value === 'bigint') return value.toString();
      return value;
    });
    sessionStorage.setItem('currentUser', userToStore);
    user.sessionInfo = { isTemporary: true };
    this.currentUserSubject.next(user);
  }

  logout() {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}