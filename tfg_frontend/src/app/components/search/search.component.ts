import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { InputTextModule } from 'primeng/inputtext';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    MatIconModule,
    InputTextModule,
    MatButtonModule,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchBarComponent {
  @Output() search: EventEmitter<string> = new EventEmitter<string>();
  @Output() clear: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('searchText') input!: ElementRef<HTMLInputElement>;

  onSearch() {
    this.search.emit(this.input.nativeElement.value);
  }

  onClear() {
    this.input.nativeElement.value = '';
    this.clear.emit();
  }
}
