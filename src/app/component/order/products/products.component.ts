import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import { IOrders, IProducts } from '../../../shared/facades/orders';
import { OrderService } from '../order.service';
import { IColumnDef } from '../../../shared/ui-component/common-list/common-list.facades';
import { CommonListComponent } from '../../../shared/ui-component/common-list/common-list.component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ControlsOf } from '../../../shared/facades/typed-form';
import { ValidationService } from '../../../core/service/validation.service';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { AddProductComponent } from './add-product/add-product.component';
import { APP_CONSTANT } from '../../../app-constant';
import { ConfirmationComponent } from '../../../shared/ui-component/confirmation/confirmation.component';
import { RouterModule } from '@angular/router';
import { CoreService } from '../../../core/service/core.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonListComponent, DatePipe, CurrencyPipe, RouterModule],
  templateUrl: './products.component.html',
})
export default class ProductsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('actionItem') actionItem!: TemplateRef<any>;
  @ViewChild('priceFormate') priceFormate!: TemplateRef<any>;

  orderNo = input('', { alias: 'id' });
  orderDetail = signal<IOrders | undefined>(undefined);

  amount = computed(() => {
    return this.orderDetail()?.products?.reduce((acc, product) => {
      acc += product.value;
      return acc;
    }, 0);
  });
  currency = APP_CONSTANT.currency;

  columnDef!: IColumnDef[];
  dialogRef!: DialogRef<any, any>;
  constructor(
    private orderService: OrderService,
    private fb: FormBuilder,
    private dialog: Dialog,
    private coreService: CoreService
  ) {}
  ngOnDestroy(): void {
    this.dialogRef?.close();
  }

  ngOnInit(): void {
    if (this.orderNo()) {
      this.getOrderDetail(this.orderNo());
    }
  }
  ngAfterViewInit(): void {
    this.setColumnDef();
  }

  addProducts(): void {
    this.dialogRef = this.dialog.open(AddProductComponent, {
      data: {
        // productDetail
      },
    });

    this.dialogRef.closed.subscribe((value) => {
      if (value) {
        this.orderDetail.update((order) => {
          if (order) {
            order['products'] = [...(order?.products || []), value];
          }
          return { ...(order as IOrders) };
        });

        this.updateOrder();
        this.coreService.showToast('success', `Product created successfully!`);
      }
    });
  }

  editProduct(id: string): void {
    const product = this.orderDetail()?.products?.find(
      (product) => product.id === id
    );
    if (product) {
      this.dialogRef = this.dialog.open(AddProductComponent, {
        data: {
          productDetail: product,
        },
      });

      this.dialogRef.closed.subscribe((value) => {
        if (value) {
          this.orderDetail.update((order) => {
            if (order) {
              order['products'] = order.products?.map((p) => {
                if (p.id === id) {
                  return {
                    ...p,
                    ...value,
                  };
                }
                return p;
              });
            }
            return { ...(order as IOrders) };
          });
          this.updateOrder();
          this.coreService.showToast(
            'success',
            `Product updated successfully!`
          );
        }
      });
    }
  }

  deleteProduct(id: string): void {
    this.dialogRef = this.dialog.open(ConfirmationComponent, {
      data: {
        confirmationTitle: 'Remove Product?',
        confirmationMessage: `Do you want to remove this product?`,
      },
    });
    this.dialogRef.closed.subscribe((value) => {
      if (value) {
        this.orderDetail.update((order) => {
          if (order) {
            order['products'] = order.products?.filter((p) => p.id !== id);
          }
          return { ...(order as IOrders) };
        });
        this.updateOrder();
      }
    });
  }

  private getOrderDetail(orderNo: string): void {
    const order = this.orderService.getOrderByOrderNo(orderNo);
    if (order) {
      this.orderDetail.set(order);
    }
  }

  private setColumnDef(): void {
    this.columnDef = [
      {
        label: 'Sr.',
        labelKey: 'sr',
        columnClass: '',
        headerClass: 'col-1',
        isSerialNo: true,
      },
      {
        label: 'P.Code',
        labelKey: 'pCode',
        columnClass: '',
        headerClass: 'col-1',
      },
      {
        label: 'Product',
        labelKey: 'productName',
        columnClass: '',
        headerClass: 'col-2',
      },
      {
        label: 'Make',
        labelKey: 'make',
        columnClass: '',
        headerClass: 'col-2',
      },
      {
        label: 'Pack',
        labelKey: 'pack',
        columnClass: '',
        headerClass: 'col-1',
      },
      {
        label: 'Unit',
        labelKey: 'unit',
        columnClass: '',
        headerClass: 'col-1',
      },
      {
        label: 'Qty',
        labelKey: 'qty',
        columnClass: '',
        headerClass: 'col-1',
        templateRef: this.priceFormate,
      },
      {
        label: 'PTR',
        labelKey: 'ptr',
        columnClass: '',
        headerClass: 'col-1',
        templateRef: this.priceFormate,
      },
      {
        label: 'Value',
        labelKey: 'value',
        columnClass: '',
        headerClass: 'col-2',
        templateRef: this.priceFormate,
      },
      {
        label: 'Action',
        labelKey: '',
        columnClass: '',
        headerClass: 'col-2',
        templateRef: this.actionItem,
      },
    ];
  }

  private updateOrder(): void {
    this.orderDetail.update((order) => {
      if (order) {
        order.amount = this.amount() as number;
      }
      return order;
    });
    this.orderService.addOrUpdateOrder(
      this.orderDetail() as IOrders,
      this.orderNo()
    );
  }
}
