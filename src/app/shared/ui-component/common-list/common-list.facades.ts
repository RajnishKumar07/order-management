import { TemplateRef } from '@angular/core';

export interface IColumnDef {
  label: string;
  labelKey: string;
  columnClass: string;
  headerClass: string;
  templateRef?: TemplateRef<any>;
  isSerialNo?: boolean;
  enableSort?: boolean;
}
