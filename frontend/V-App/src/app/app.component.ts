import { Component, OnInit } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { RouterExtensions } from '@nativescript/angular'
import {
  DrawerTransitionBase,
  RadSideDrawer,
  SlideInOnTopTransition,
} from 'nativescript-ui-sidedrawer'
import { filter } from 'rxjs/operators'
import { Application } from '@nativescript/core'
import { SessionService } from './shared/session.service'

@Component({
  selector: 'ns-app',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
  private _activatedUrl = '/login'
  private _sideDrawerTransition: DrawerTransitionBase = new SlideInOnTopTransition()
  userName = 'Guest'
  userFootnote = 'Not logged in'

  constructor(
    private router: Router,
    private routerExtensions: RouterExtensions,
    private sessionService: SessionService,
  ) {
    // Use the component constructor to inject services.
  }

  ngOnInit(): void {
    this.refreshUser()

    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this._activatedUrl = event.urlAfterRedirects
        this.refreshUser()
      })
  }

  get sideDrawerTransition(): DrawerTransitionBase {
    return this._sideDrawerTransition
  }

  isComponentSelected(url: string): boolean {
    return this._activatedUrl === url
  }

  onNavItemTap(navItemRoute: string): void {
    if (navItemRoute === '/dashboard') {
      const user = this.sessionService.getUser<{ id?: string | number } | null>()
      if (!user || !user.id) {
        navItemRoute = '/login'
      }
    }

    this.routerExtensions.navigate([navItemRoute], {
      transition: {
        name: 'fade',
      },
    })

    const sideDrawer = <RadSideDrawer>Application.getRootView()
    sideDrawer.closeDrawer()
  }

  onLogoutTap(): void {
    this.sessionService.clearSession()
    this.refreshUser()

    this.routerExtensions.navigate(['/login'], {
      clearHistory: true,
      transition: {
        name: 'fade',
      },
    })

    const sideDrawer = <RadSideDrawer>Application.getRootView()
    sideDrawer.closeDrawer()
  }

  private refreshUser(): void {
    const user = this.sessionService.getUser<{ name?: string } | null>()
    const authenticated = Boolean(user && user.name)
    this.userName = authenticated ? String(user?.name) : 'Guest'
    this.userFootnote = authenticated ? 'Logged in' : 'Not logged in'
  }
}
