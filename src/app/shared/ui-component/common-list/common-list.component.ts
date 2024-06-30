import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  effect,
  input,
  signal,
} from '@angular/core';
import { IColumnDef } from './common-list.facades';
import { CommonModule } from '@angular/common';
import { APP_CONSTANT } from '../../../app-constant';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-common-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './common-list.component.html',
})
export class CommonListComponent implements OnInit {
  @Output() onSort = new EventEmitter();
  columnDef = input<IColumnDef[]>();
  columnData = input<any[]>();
  noDataImageUrl = APP_CONSTANT.noDataImageUrl;

  sortControl = new FormControl({
    fieldName: '',
    value: '',
  });
  constructor() {}
  ngOnInit(): void {
    this.sortControl.valueChanges.subscribe((value) => {
      this.onSort.emit(value);
    });
  }

  onSortFn(fieldName: string) {
    if (this.sortControl.value?.fieldName === fieldName) {
      switch (this.sortControl.value?.value) {
        case 'asc':
          this.sortControl.setValue({
            fieldName: fieldName,
            value: 'desc',
          });
          break;
        case 'desc':
          this.sortControl.setValue({
            fieldName: fieldName,
            value: '',
          });
          break;
        case '':
          this.sortControl.setValue({
            fieldName: fieldName,
            value: 'asc',
          });
          break;
        default:
          this.sortControl.setValue({
            fieldName: fieldName,
            value: '',
          });
          break;
      }
    } else {
      this.sortControl.setValue({
        fieldName: fieldName,
        value: 'asc',
      });
    }
  }
}
