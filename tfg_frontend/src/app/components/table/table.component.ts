import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  OnInit,
  inject,
  ChangeDetectorRef,
  ElementRef,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ColumnsConfig } from './table';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    MatTableModule,
    CommonModule,
    MatPaginatorModule,
    MatIconModule,
    MatCheckboxModule,
    MatSortModule,
    MatTableModule,
    MatSortModule,
    TranslateModule,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class TableComponent<T> implements OnChanges, AfterViewInit, OnInit {
  @Input() tableData!: T[]; // Datos de la tabla
  @Input() tableConfig: ColumnsConfig[] = []; // Configuración de columnas
  @Input() showActions: boolean = false; // Mostrar acciones
  @Input() isUserIcons: boolean = false; // Mostrar iconos de usuario
  @Input() isFlatTable: boolean = false;
  @Input() selectedRows: T[] = [];
  @Input() colorRules: { [key: string]: { red?: number; green?: number } } = {};

  @Output() selectedRow: EventEmitter<T> = new EventEmitter<T>(); // Evento de fila seleccionada
  @Output() doubleClick: EventEmitter<T> = new EventEmitter<T>(); // Evento de doble clic
  @Output() delete = new EventEmitter<T>(); // Evento de eliminar
  @Output() edit = new EventEmitter<T>(); // Evento de editar
  @Output() accept = new EventEmitter<T>(); // Evento de aceptar
  @Output() decline = new EventEmitter<T>(); // Evento de rechazar

  private _liveAnnouncer = inject(LiveAnnouncer);
  private paginatorSet = false;

  dataSource: MatTableDataSource<T> = new MatTableDataSource(); // Fuente de datos para la tabla
  actualRow?: T; // Fila actualmente seleccionada
  expandedRow?: T | null = null; // Fila actualmente expandida

  @ViewChild(MatSort) sort!: MatSort; // Referencia para el ordenamiento
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatPaginator, { read: ElementRef }) paginatorElement!: ElementRef;

  @Output() selectedRowsChange = new EventEmitter<T[]>();
  // selectedRows: T[] = []; // Filas seleccionadas
  @Input() hasCheckboxColumn: boolean = false; // Indica si hay columna de checkbox

  ngOnInit() {
    // Configura sortable al iniciar
    this.tableConfig = this.tableConfig.map(config => ({
      ...config,
      sortable: config.sortable ?? false, // Por defecto será false al iniciar
    }));

    // Determinar si hay una columna de casilla de verificación
    if (!this.hasCheckboxColumn) {
      this.hasCheckboxColumn = this.tableConfig.some(
        config => config.isCheckbox
      );
    }

    // Mostrar columnas ordenables
    // this.logSortableColumns();
  }

  getCellClass(value: any, field: string): string {
    // Quitar % si existe
    if (typeof value === 'string' && value.includes('%')) {
      value = parseFloat(value.replace('%', ''));
    }

    // Reglas para matchPercentage
    if (field === 'matchPercentage' && this.colorRules['matchPercentage']) {
      const rules = this.colorRules['matchPercentage'];
      if (rules.red !== undefined && value < rules.red) return 'cell-red';
      if (rules.green !== undefined && value > rules.green) return 'cell-green';
    }

    // Reglas para kappa por parejas
    if (field.includes('_vs_') && this.colorRules['kappa']) {
      const rules = this.colorRules['kappa'];
      if (rules.red !== undefined && value < rules.red) return 'cell-red';
      if (rules.green !== undefined && value > rules.green) return 'cell-green';
    }

    return '';
  }

  constructor(private cdr: ChangeDetectorRef) {}
  private lastTableDataJson: string = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tableData']) {
      const currentDataJson = JSON.stringify(this.tableData);
      if (currentDataJson !== this.lastTableDataJson) {
        this.lastTableDataJson = currentDataJson;
        this.dataSource.data = [...this.tableData];
        this.dataSource._updateChangeSubscription();
      }
    }

    if (changes['selectedRows'] && this.dataSource) {
      // Esto fuerza que los checkboxes se actualicen visualmente
      this.dataSource._updateChangeSubscription();
    }

    if (changes['tableConfig']) {
      setTimeout(() => {
        if (this.tableConfig && this.tableConfig.length > 0) {
          this.cdr.detectChanges();
        } else {
          console.warn('Table Config is empty or not loaded yet');
        }
      }, 0);
    }
  }

  ngAfterViewInit() {
    if (!this.paginatorSet) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.paginatorSet = true;
    }
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  getColumnFields(): string[] {
    const baseColumns = this.tableConfig.map(tb => tb.apiField);

    if (this.isFlatTable) {
      // En modo tabla plana solo columnas básicas (sin checkbox, acciones ni expand)
      return baseColumns;
    }

    // Modo normal: agregamos checkbox, acciones y expand
    const columns = this.hasCheckboxColumn
      ? ['select', ...baseColumns]
      : baseColumns;

    if (this.showActions) {
      columns.push('actions');
    }
    columns.push('expand');

    return columns;
  }

  toggleRowSelection(row: T): void {
    const index = this.selectedRows.indexOf(row);
    if (index === -1) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows.splice(index, 1);
    }
    this.selectedRowsChange.emit([...this.selectedRows]); // Emite copia actualizada
  }

  toggleSelectAll(event: any): void {
    if (event.checked) {
      this.selectedRows = [...this.dataSource.data];
    } else {
      this.selectedRows = [];
    }
    this.selectedRowsChange.emit([...this.selectedRows]);
  }

  isSelected(row: T): boolean {
    return this.selectedRows.includes(row);
  }

  isAllSelected(): boolean {
    return this.selectedRows.length === this.dataSource.data.length;
  }

  selectRow(row: T) {
    if (this.actualRow !== row) {
      this.actualRow = row;
      this.selectedRow.emit(row);
    } else {
      this.actualRow = undefined;
      this.selectedRow.emit();
    }
  }

  onTableRowDblClick(row: T) {
    this.doubleClick.emit(row);
  }

  onDeleteClick(row: T) {
    this.delete.emit(row);
  }

  onEditClick(row: T) {
    this.edit.emit(row);
  }

  onAccept(row: T) {
    this.accept.emit(row);
  }

  onDeclineClick(row: T) {
    this.decline.emit(row);
  }

  needsExpansion(row: T): boolean {
    const description = (row as any).description;
    return typeof description === 'string' && description.length > 100;
  }

  getShortText(row: T, maxLength: number = 50): string {
    const description = (row as any).description || '';
    return description.length > maxLength
      ? description.slice(0, maxLength) + '...'
      : description;
  }

  /**
   *
   * trackBy ayuda a hacer un seguimiento de las columnas de la tabla usando apiField como id
   * Así, solo actualiza las columnas que hayan cambiado y no pierde la traducción
   */
  trackByColumn(index: number, column: ColumnsConfig): string {
    return column.apiField; // Usa el campo apiField para hacer track de las columnas
  }
}
