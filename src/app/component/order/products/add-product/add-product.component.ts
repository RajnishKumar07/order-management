import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ControlsOf } from '../../../../shared/facades/typed-form';
import { IProducts } from '../../../../shared/facades/orders';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ValidationService } from '../../../../core/service/validation.service';
import { NumberOnlyDirective } from '../../../../shared/directives/number-only.directive';
import { AlphaNumericDirective } from '../../../../shared/directives/alpha-numeric.directive';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [ReactiveFormsModule, NumberOnlyDirective, AlphaNumericDirective],
  templateUrl: './add-product.component.html',
})
export class AddProductComponent implements OnInit {
  productForm!: FormGroup<ControlsOf<IProducts>>;
  productId!: string;
  isSubmitted = false;
  constructor(
    private fb: FormBuilder,
    @Inject(DIALOG_DATA)
    public data: {
      productDetail: IProducts;
    },
    public dialogRef: DialogRef
  ) {
    if (data?.productDetail?.id) {
      this.productId = data.productDetail.id;
    }
  }
  ngOnInit(): void {
    this.prepareForm();
    if (this.productId) {
      this.patchForm(this.data.productDetail);
    }

    this.productForm.controls['qty'].valueChanges.subscribe((value) => {
      const ptr = this.productForm.controls['ptr'].value;
      if (ptr && value) {
        this.productForm.controls['value'].setValue(ptr * value);
      } else {
        this.productForm.controls['value'].setValue(0);
      }
    });
    this.productForm.controls['ptr'].valueChanges.subscribe((value) => {
      const qty = this.productForm.controls['qty'].value;
      if (qty && value) {
        this.productForm.controls['value'].setValue(qty * value);
      } else {
        this.productForm.controls['value'].setValue(0);
      }
    });
  }

  submitProduct(): void {
    this.isSubmitted = true;
    if (this.productForm.invalid) {
      return;
    }
    this.close(this.productForm.getRawValue());
  }

  close(data?: any) {
    this.dialogRef?.close(data);
  }

  private prepareForm(): void {
    this.productForm = this.fb.group<ControlsOf<IProducts>>({
      id: this.fb.nonNullable.control(this.generateId()),
      pCode: this.fb.nonNullable.control('', [ValidationService.required]),
      productName: this.fb.nonNullable.control('', [
        ValidationService.required,
      ]),
      make: this.fb.nonNullable.control('', [ValidationService.required]),
      pack: this.fb.nonNullable.control('', [ValidationService.required]),
      unit: this.fb.nonNullable.control('', [ValidationService.required]),
      qty: this.fb.nonNullable.control(null, [ValidationService.required]),
      ptr: this.fb.nonNullable.control(null, [ValidationService.required]),
      value: this.fb.nonNullable.control({ value: 0, disabled: true }, [
        ValidationService.required,
      ]),
    });
  }

  private patchForm(productDetail: IProducts): void {
    this.productForm.patchValue({
      ...productDetail,
    });
  }

  private generateId(): string {
    return Math.random().toString(36).slice(2, 9);
  }
}
