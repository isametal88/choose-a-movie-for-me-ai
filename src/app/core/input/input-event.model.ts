export type InputAction =
  | 'navigate-up'
  | 'navigate-down'
  | 'navigate-left'
  | 'navigate-right'
  | 'confirm'
  | 'back'
  | 'search';

export interface NormalizedInputEvent {
  action: InputAction;
  originalEvent: Event;
}
