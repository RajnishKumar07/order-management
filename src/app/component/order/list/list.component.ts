import {
  AfterViewInit,
  Component,
  TemplateRef,
  ViewChild,
  effect,
  signal,
} from '@angular/core';
import { CommonListComponent } from '../../../shared/ui-component/common-list/common-list.component';
import { OrderService } from '../order.service';
import { IOrders } from '../../../shared/facades/orders';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IColumnDef } from '../../../shared/ui-component/common-list/common-list.facades';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { CoreService } from '../../../core/service/core.service';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ConfirmationComponent } from '../../../shared/ui-component/confirmation/confirmation.component';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { APP_CONSTANT } from '../../../app-constant';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonListComponent,
    NgbPagination,
    RouterModule,
    ReactiveFormsModule,
    CurrencyPipe,
    NgClass,
    DatePipe,
  ],
  templateUrl: './list.component.html',
})
export default class ListComponent implements AfterViewInit {
  @ViewChild('actionItem') actionItem!: TemplateRef<any>;
  @ViewChild('priceFormate') priceFormate!: TemplateRef<any>;
  @ViewChild('priorityCol') priorityCol!: TemplateRef<any>;
  @ViewChild('dateFormate') dateFormate!: TemplateRef<any>;

  allOrders = signal<IOrders[]>([]);
  pagination!: {
    currentPage: number;
    totalProducts: number;
    limit: number;
  };
  searchControl = new FormControl('');
  sort!: { fieldName: string; value: string };
  currency = APP_CONSTANT.currency;

  columnDef!: IColumnDef[];
  dialogRef!: DialogRef<any, any>;
  constructor(
    private orderService: OrderService,
    private coreService: CoreService,
    private dialog: Dialog
  ) {
    this.pagination = {
      currentPage: 1,
      totalProducts: this.orderService.totalOrdersCount() || 0,
      limit: 5,
    };
    effect(
      () => {
        this.pagination = {
          ...this.pagination,
          totalProducts: this.orderService.totalOrdersCount() || 0,
        };
      },
      { allowSignalWrites: true }
    );

    this.orderService.getOrderDetails();
    effect(
      () => {
        if (this.orderService.allOrders()?.length) {
          this.getOrders();
          this.pagination.totalProducts = this.orderService.allOrders().length;
        }
      },
      { allowSignalWrites: true }
    );
    this.getOrders();
    this.searchControl.valueChanges.subscribe((value) => {
      this.pagination.currentPage = 1;
      this.getOrders();
    });
  }

  ngAfterViewInit(): void {
    this.setColumnDef();
  }

  getOrders(): void {
    this.allOrders.set(
      this.orderService.getOrders(
        this.pagination?.currentPage || 1,
        this.pagination?.limit || 5,
        this.searchControl.value || '',
        this.sort
      )
    );
  }

  setColumnDef(): void {
    this.columnDef = [
      {
        label: 'Order No.',
        labelKey: 'orderNo',
        columnClass: '',
        headerClass: 'col-2',
      },
      {
        label: 'Date & Time',
        labelKey: 'dateAndTime',
        columnClass: '',
        headerClass: 'col-2',
        enableSort: true,
        templateRef: this.dateFormate,
      },
      {
        label: 'PCode',
        labelKey: 'pCode',
        columnClass: '',
        headerClass: 'col-2',
      },
      {
        label: 'Party Name',
        labelKey: 'partyName',
        columnClass: '',
        headerClass: 'col-2',
        enableSort: true,
      },
      {
        label: 'City',
        labelKey: 'city',
        columnClass: '',
        headerClass: 'col-2',
      },
      {
        label: 'Amount',
        labelKey: 'amount',
        columnClass: 'text-right', // You might want to right-align numeric values
        headerClass: 'col-2 text-right',
        templateRef: this.priceFormate,
        enableSort: true,
      },
      {
        label: 'Order By',
        labelKey: 'orderBy',
        columnClass: '',
        headerClass: 'col-2',
      },
      {
        label: 'Priority',
        labelKey: 'priority',
        columnClass: '',
        headerClass: 'col-2',
        templateRef: this.priorityCol,
        enableSort: true,
      },
      {
        label: 'Delivery Mode',
        labelKey: 'deliveryMode',
        columnClass: '',
        headerClass: 'col-2',
      },
      {
        label: 'Status',
        labelKey: 'status',
        columnClass: '',
        headerClass: 'col-2',
      },
      {
        label: 'Actions',
        labelKey: '',
        columnClass: '',
        headerClass: 'col-2',
        templateRef: this.actionItem,
      },
    ];
  }

  deleteOrder(orderNo: string): void {
    this.dialogRef = this.dialog.open(ConfirmationComponent, {
      data: {
        confirmationTitle: 'Remove Product?',
        confirmationMessage: `Do you want to remove this product?`,
      },
    });
    this.dialogRef.closed.subscribe((value) => {
      if (value) {
        this.orderService.removeOrder(orderNo);
        this.coreService.showToast('success', 'Order deleted successfully!');
      }
    });
  }

  onPageChange(pageNo: number) {
    this.pagination.currentPage = pageNo;
    this.getOrders();
  }

  onSort(event: { fieldName: string; value: string }) {
    this.sort = event;
    this.pagination.currentPage = 1;
    this.getOrders();
  }
}
