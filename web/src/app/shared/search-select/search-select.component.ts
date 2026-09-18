import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';

export interface SelectOption {
  id: number | string;
  label: string;
}

@Component({
  selector: 'app-search-select',
  standalone: true,
  imports: [],
  templateUrl: './search-select.component.html'
})
export class SearchSelectComponent {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Pesquisar…';
  @Input() disabled = false;
  @Input() disabledHint = 'Escolhe primeiro a opção anterior';
  @Input() value: SelectOption | null = null;
  @Output() valueChange = new EventEmitter<SelectOption | null>();

  query = signal('');
  open = signal(false);

  filtered = computed(() => {
    const q = this.query().toLowerCase();
    return this.options.filter(o => o.label.toLowerCase().includes(q));
  });

  onFocus(): void {
    if (!this.disabled) this.open.set(true);
  }

  onBlur(): void {
    setTimeout(() => this.open.set(false), 150);
  }

  onInput(v: string): void {
    this.query.set(v);
    this.open.set(true);
    if (this.value) this.valueChange.emit(null);
  }

  select(opt: SelectOption): void {
    this.valueChange.emit(opt);
    this.query.set('');
    this.open.set(false);
  }
}
