import { AbstractControl, ControlContainer } from '@angular/forms';

/**
 * Finds a form control explicitly or by name from the ControlContainer.
 *
 * @param control An existing form control, as passed with the formControl directive
 * @param controlName An form control name, as passed with the formControlName directive
 * @param controlContainer The Directive’s ControlContainer
 */
export const findFormControl = (
  control?: AbstractControl,
  controlName?: string,
  controlContainer?: ControlContainer,
): AbstractControl => {
  if (control) {
    return control;
  }
  if (!controlName) {
    throw new Error('getFormControl: control or control name must be given');
  }
  if (!(controlContainer && controlContainer.control)) {
    throw new Error(
      'getFormControl: control name was given but parent control not found',
    );
  }
  const controlFromName = controlContainer.control.get(controlName);
  if (!controlFromName) {
    throw new Error(`getFormControl: control '${controlName}' not found`);
  }
  return controlFromName;
};
