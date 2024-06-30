import { Component, OnInit, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CoreService } from '../core/service/core.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  enableSearch = false;
  searchControl = new FormControl('');
  brandText = 'Order Management';
  menus: {
    routerLink: string;
    label: string;
  }[] = [
    {
      label: 'Orders',
      routerLink: 'orders',
    },
    {
      label: 'Add Orders',
      routerLink: 'orders/create',
    },
  ];
  constructor(private router: Router, private coreService: CoreService) {
    effect(() => {
      if (this.coreService.updateState()?.event === 'employeeSearch') {
        this.searchControl.setValue(this.coreService.updateState()?.value, {
          emitEvent: false,
        });
      }
    });
  }

  ngOnInit(): void {
    // Initial check on component load
    this.checkUrl(this.router.url);

    // Subscribe to router events to handle subsequent navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkUrl(event.url);
      }
    });

    this.searchControl.valueChanges.subscribe((value) => {
      this.coreService.updateState.set({
        event: 'employeeSearch',
        value,
      });
    });
  }

  private checkUrl(url: string): void {
    if (url === '/employees') {
      this.enableSearch = true;
    } else {
      this.enableSearch = false;
    }
  }
}
