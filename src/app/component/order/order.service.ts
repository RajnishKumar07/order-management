import { Injectable, effect, signal } from '@angular/core';
import { IOrders } from '../../shared/facades/orders';
import { ApiService } from '../../core/service/api.service';
import { ApiResponse } from '../../shared/facades/api-response';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private newAddedItem: IOrders[] = []; //Because using static data,If we use API then it will not needed.
  allOrders = signal<IOrders[]>([]);

  totalOrdersCount = signal<number | null>(0);
  constructor(private apiService: ApiService) {}

  /**
   * To get all order from api
   */
  getOrderDetails(): void {
    if (!this.allOrders()?.length) {
      this.apiService
        .get<ApiResponse<IOrders[]>>('/assets/static-data/all-orders.json')
        .subscribe({
          next: (res) => {
            this.allOrders.set([...this.newAddedItem, ...res.data]);
          },
        });
    }
  }

  /**
   * To get order based on pagination,sorting,searching.
   * @param currentPage
   * @param limit
   * @param searchString
   * @param sort
   * @returns  IOrders[]
   */
  getOrders(
    currentPage: number,
    limit: number,
    searchString = '',
    sort?: { fieldName: string; value: string }
  ): IOrders[] {
    let allOrders: IOrders[] = JSON.parse(JSON.stringify(this.allOrders()));
    if (searchString) {
      allOrders = allOrders.filter((order) =>
        order.partyName.toLowerCase().includes(searchString.toLowerCase())
      );
    }
    if (sort) {
      switch (sort.value) {
        case 'asc':
          allOrders = allOrders.sort((order1: any, order2: any) => {
            if (typeof order1[sort.fieldName] === 'string') {
              return order1[sort.fieldName].localeCompare(
                order2[sort.fieldName]
              );
            }
            return order1[sort.fieldName] - order2[sort.fieldName];
          });
          break;
        case 'desc':
          allOrders = allOrders.sort((order1: any, order2: any) => {
            if (typeof order1[sort.fieldName] === 'string') {
              return order2[sort.fieldName].localeCompare(
                order1[sort.fieldName]
              );
            }
            return order2[sort.fieldName] - order1[sort.fieldName];
          });
          break;
      }
    }
    this.totalOrdersCount.set(null);
    this.totalOrdersCount.set(allOrders.length);

    return allOrders.slice((currentPage - 1) * limit, currentPage * limit);
  }

  /**
   * Add or update order based on unique order Number
   * @param data
   * @param orderNo
   * @returns
   */
  addOrUpdateOrder(data: IOrders, orderNo?: string): string | undefined {
    let payload: IOrders;
    if (orderNo) {
      this.allOrders.update((orders) => {
        orders = orders.map((order) => {
          if (order.orderNo === orderNo) {
            payload = {
              ...order,
              ...data,
              orderNo: order.orderNo,
              dateAndTime: order.dateAndTime,
              products: order.products,
            };
            return payload;
          }
          return order;
        });
        return orders;
      });
      return;
    } else {
      const orderNo = this.generateOrderNumber();
      payload = {
        ...data,
        orderNo,
        dateAndTime: new Date().toISOString(),
        products: [],
      };
      this.newAddedItem.push(payload);
      this.allOrders.update((orders) => [payload, ...orders]);
      return payload?.orderNo;
    }
  }

  /**
   * To get a single order by order Number
   * @param orderNo
   * @returns
   */
  getOrderByOrderNo(orderNo: string): IOrders | undefined {
    return this.allOrders().find((order) => order.orderNo === orderNo);
  }

  /**
   * To remove order from order list by order No.
   * @param orderNo
   */
  removeOrder(orderNo: string): void {
    this.allOrders.update((orders) => {
      return orders.filter((order) => order.orderNo !== orderNo);
    });
  }

  /**
   * To generate Unique order number
   * @returns
   */
  private generateOrderNumber(): string {
    const prefix = 'MRR';
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14); // YYYYMMDDHHMMSS
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
    return `${prefix}${timestamp}${randomNum}`;
  }
}
