import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap
} from 'rxjs/operators';

import { VehicleService } from '../../core/services/vehicle.service';
import { Vehicle, VehicleDataRow } from '../../core/models/vehicle.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {

  // ---------- Busca 1: veículo por modelo (GET /vehicles, filtrado no front) ----------
  modelSearchTerm = '';
  private modelSearch$ = new Subject<string>();
  filteredVehicles: Vehicle[] = [];
  selectedVehicle: Vehicle | null = null;
  loadingVehicles = false;

  // ---------- Busca 2: veículo por código VIN (POST /vehicleData) ----------
  codeSearchTerm = '';
  private codeSearch$ = new Subject<string>();
  vehicleDataRow: VehicleDataRow | null = null;
  loadingTable = false;
  tableError = '';

  private subscriptions = new Subscription();

  constructor(
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupModelSearch();
    this.setupCodeSearch();

    // Carrega o estado inicial da lista de veículos.
    this.modelSearch$.next('');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Pipeline reativo da Busca 1 (cartão de busca por modelo).
   * Operadores exigidos: debounceTime, distinctUntilChanged, filter, map.
   */
  private setupModelSearch(): void {
    const sub = this.modelSearch$
      .pipe(
        debounceTime(350),                  // aguarda o usuário parar de digitar
        distinctUntilChanged(),             // ignora buscas repetidas em sequência
        filter((term) => term !== null && term !== undefined), // descarta valores inválidos
        switchMap((term) => {
          this.loadingVehicles = true;
          return this.vehicleService.getVehicles().pipe(
            map((vehicles) =>
              vehicles.filter((v) =>
                v.vehicle.toLowerCase().includes(term.trim().toLowerCase())
              )
            )
          );
        })
      )
      .subscribe({
        next: (vehicles) => {
          this.filteredVehicles = vehicles;
          this.loadingVehicles = false;

          // Mantém o veículo selecionado sincronizado com o resultado da busca;
          // caso não exista mais na lista filtrada, seleciona o primeiro resultado.
          if (vehicles.length && !vehicles.find((v) => v.id === this.selectedVehicle?.id)) {
            this.selectVehicle(vehicles[0]);
          } else if (!vehicles.length) {
            this.selectedVehicle = null;
          }
        },
        error: () => {
          this.loadingVehicles = false;
          this.filteredVehicles = [];
        }
      });

    this.subscriptions.add(sub);
  }

  /**
   * Pipeline reativo da Busca 2 (tabela por código VIN).
   * A API só aceita uma busca exata via POST /vehicleData e retorna
   * um único objeto (não uma lista), então o "filter" aqui também
   * garante um tamanho mínimo de VIN antes de disparar a chamada,
   * evitando requisições desnecessárias a cada tecla.
   *
   * Operadores exigidos: debounceTime, distinctUntilChanged, filter, map.
   */
  private setupCodeSearch(): void {
    const sub = this.codeSearch$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter((term) => term.trim().length >= 5), // exige um VIN minimamente completo
        switchMap((term) => {
          this.loadingTable = true;
          this.tableError = '';
          const vin = term.trim();

          return this.vehicleService.searchVehicleByVin(vin).pipe(
            // A API não devolve o VIN buscado na resposta, então o anexamos
            // ao resultado para exibir na primeira coluna da tabela.
            map((data) => (data ? { ...data, vin } : null))
          );
        })
      )
      .subscribe({
        next: (row) => {
          this.loadingTable = false;
          this.vehicleDataRow = row;
          if (!row) {
            this.tableError = 'Código VIN não encontrado.';
          }
        },
        error: () => {
          this.loadingTable = false;
          this.vehicleDataRow = null;
          this.tableError = 'Falha na comunicação com a API.';
        }
      });

    this.subscriptions.add(sub);
  }

  /** Disparado pelo (ngModelChange) do campo de busca por modelo. */
  onModelSearchChange(term: string): void {
    this.modelSearch$.next(term);
  }

  /** Disparado pelo (ngModelChange) do campo de busca por código VIN. */
  onCodeSearchChange(term: string): void {
    if (!term || term.trim().length < 5) {
      this.vehicleDataRow = null;
      this.tableError = '';
    }
    this.codeSearch$.next(term);
  }

  /** Atualiza reativamente os cards e a imagem central. */
  selectVehicle(vehicle: Vehicle): void {
    this.selectedVehicle = vehicle;
  }

  statusBadgeClass(status: string): string {
    const normalized = status.toLowerCase();
    if (normalized === 'on') return 'badge-status badge-status--online';
    return 'badge-status badge-status--offline';
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
