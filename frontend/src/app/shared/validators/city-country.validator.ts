import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cityCountryValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const regex = /^[a-zA-Z\s]+,\s*[a-zA-Z\s]+$/;

    if (!value) {
      return null;
    }

    return regex.test(value) ? null : { invalidCityCountry: true };
  };
}
