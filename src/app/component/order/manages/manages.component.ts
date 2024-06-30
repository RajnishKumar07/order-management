import { Component, OnInit, input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ControlsOf } from '../../../shared/facades/typed-form';
import { IOrders } from '../../../shared/facades/orders';
import { ValidationService } from '../../../core/service/validation.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../order.service';
import { CoreService } from '../../../core/service/core.service';

@Component({
  selector: 'app-manages',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, RouterModule],
  templateUrl: './manages.component.html',
})
export default class ManagesComponent implements OnInit {
  orderNo = input('', { alias: 'id' });
  orderForm!: FormGroup<ControlsOf<IOrders>>;
  orderByOptions = [
    { label: 'SalesMan', value: 'SalesMan' },
    { label: 'Party Self', value: 'Party Self' },
  ];

  priorities = [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
  ];

  deliveryModes = [
    { label: 'Deliver to Store', value: 'Deliver to Store' },
    { label: 'Pickup from Counter', value: 'Pickup from Counter' },
    { label: 'Home Delivery', value: 'Home Delivery' },
  ];

  statuses = [
    { label: 'In Process', value: 'In Process' },
    { label: 'Invoiced', value: 'Invoiced' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  isSubmitted = false;
  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private coreService: CoreService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.prepareForm();
    if (this.orderNo()) {
      this.patchForm(this.orderNo());
    }
  }

  submitOrder(): void {
    this.isSubmitted = true;
    if (this.orderForm.invalid) {
      return;
    }
    const orderNo = this.orderService.addOrUpdateOrder(
      this.orderForm.getRawValue()
    );
    if (this.orderNo()) {
      this.coreService.navigateTo(['../'], { relativeTo: this.route });
    } else {
      this.coreService.navigateTo(['../products', orderNo], {
        relativeTo: this.route,
      });
    }
    this.coreService.showToast(
      'success',
      `Order ${this.orderNo() ? 'updated' : 'created'} successfully!`
    );
  }

  private prepareForm(): void {
    this.orderForm = this.fb.group<ControlsOf<IOrders>>({
      orderNo: this.fb.nonNullable.control(''),
      dateAndTime: this.fb.nonNullable.control(''),
      pCode: this.fb.nonNullable.control('', [ValidationService.required]),
      partyName: this.fb.nonNullable.control('', [ValidationService.required]),
      city: this.fb.nonNullable.control('', [ValidationService.required]),
      amount: this.fb.nonNullable.control(0, [ValidationService.required]),
      orderBy: this.fb.nonNullable.control(null, [ValidationService.required]),
      priority: this.fb.nonNullable.control(null, [ValidationService.required]),
      deliveryMode: this.fb.nonNullable.control(null, [
        ValidationService.required,
      ]),
      status: this.fb.nonNullable.control(null, [ValidationService.required]),
    });
  }

  private patchForm(orderNo: string) {
    const order = this.orderService.getOrderByOrderNo(orderNo);
    if (order) {
      this.orderForm.patchValue({
        ...order,
      });
    }
  }
}
