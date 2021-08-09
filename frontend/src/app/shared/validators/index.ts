import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * This validates a FormControl to ensure its value is in the given list
 * @param {any[]} allowedValueList - The list of allowed values
 */
export function invalidValueValidator(allowedValueList: any[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // If control value is empty, return null
    if (!control.value) {
      return null;
    }

    // Check if control value is not in the allowed list
    const invalidValue = allowedValueList.indexOf(control.value) === -1;

    return invalidValue ? { invalidValue: { value: control.value } } : null;
  };
}

/**
 * This validates a FormControl to ensure its value is a valid hostname
 */
export function hostNameValidator(
  control: AbstractControl
): ValidationErrors | null {
  // If control value is empty, return null
  if (!control.value) {
    return null;
  }

  // Check if control value is an valid hostname
  const invalidHostName =
    !/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/.test(
      control.value
    );

  return invalidHostName ? { invalidHostName: { value: control.value } } : null;
}

/**
 * This validates a FormControl to ensure its value is a valid port number
 */
export function portValidator(
  control: AbstractControl
): ValidationErrors | null {
  // If control value is empty, return null
  if (!control.value) {
    return null;
  }

  // Check if control value is an valid port number, a number between 0 and 65535
  const invalidPort =
    !/^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/.test(
      control.value
    );

  return invalidPort ? { invalidPort: { value: control.value } } : null;
}
