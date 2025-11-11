import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-generic-selector',
  standalone: true,
  templateUrl: './generic-selector.component.html',
  styleUrls: ['./generic-selector.component.scss'],
  imports: [
    FormsModule,
    CheckboxModule,
    CommonModule,
    MatButtonModule,
    TranslateModule,
  ],
})
export class GenericSelectorComponent implements OnInit, OnChanges {
  @Input() items: any[] = [];
  @Input() displayFields: string[] = ['name'];
  @Input() identifier: string = 'id';
  @Input() searchPlaceholder?: string;
  @Input() displayTemplate?: (item: any) => {
    title: string;
    subtitle?: string;
  };

  @Output() selectionChange = new EventEmitter<any[]>();

  searchTerm: string = '';
  selectedItems: any[] = [];
  filteredItems: any[] = [];
  allSelected: boolean = false;

  ngOnInit() {
    this.filteredItems = [...this.items];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items']) {
      this.filteredItems = this.filterItems();
      this.syncAllSelected();
    }
  }

  /**
   * Alterna la selección de un item individual.
   * Si ya estaba seleccionado se quita, si no, se agrega.
   */
  toggleItem(item: any): void {
    const id = item[this.identifier];
    const index = this.selectedItems.findIndex(i => i[this.identifier] === id);

    if (index > -1) {
      this.selectedItems.splice(index, 1); // Deseleccionar
    } else {
      this.selectedItems.push(item); // Seleccionar
    }

    this.syncAllSelected();
    this.emitSelection();
  }

  // Alterna la selección de todos los items filtrados
  toggleAll(): void {
    if (this.allSelected) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.filteredItems];
    }

    this.allSelected = !this.allSelected;
    this.emitSelection();
  }

  // Veriffica la selcción de un item
  isItemSelected(item: any): boolean {
    return this.selectedItems.some(
      i => i[this.identifier] === item[this.identifier]
    );
  }

  // Filtra los items
  filterItems(): any[] {
    const term = this.searchTerm.toLowerCase().trim();
    return this.items.filter(item =>
      this.displayFields.some(field =>
        (item[field] || '').toString().toLowerCase().includes(term)
      )
    );
  }

  onSearch(): void {
    this.filteredItems = this.filterItems();
    this.syncAllSelected();
  }

  syncAllSelected(): void {
    this.allSelected =
      this.filteredItems.length > 0 &&
      this.filteredItems.every(item =>
        this.selectedItems.some(
          i => i[this.identifier] === item[this.identifier]
        )
      );
  }

  // Emite  la lista de items escogidos
  emitSelection(): void {
    this.selectionChange.emit(this.selectedItems);
  }

  getItemTitle(item: any): string {
    if (this.displayTemplate) {
      return this.displayTemplate(item)?.title ?? '';
    }
    console.log(this.displayTemplate);

    // Fallback: unir todos los campos si no hay template
    return this.displayFields.map(f => item[f]).join(' ');
  }

  getItemSubtitle(item: any): string | null {
    if (this.displayTemplate) {
      return this.displayTemplate(item)?.subtitle ?? null;
    }

    return null;
  }
}
