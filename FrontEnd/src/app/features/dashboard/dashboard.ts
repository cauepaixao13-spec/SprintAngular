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
import { Vehicle, VehicleData } from '../../core/models/vehicle.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {

  // ---------- Busca 1: veículo por modelo ----------
  modelSearchTerm = '';
  private modelSearch$ = new Subject<string>();
  filteredVehicles: Vehicle[] = [];
  selectedVehicle: Vehicle | null = null;
  loadingVehicles = false;

  // ---------- Busca 2: tabela por código do veículo ----------
  codeSearchTerm = '';
  private codeSearch$ = new Subject<string>();
  vehicleDataRows: VehicleData[] = [];
  loadingTable = false;

  private subscriptions = new Subscription();

  constructor(
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupModelSearch();
    this.setupCodeSearch();

    // Carrega o estado inicial (lista completa) de ambas as fontes de dados.
    this.modelSearch$.next('');
    this.codeSearch$.next('');
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
        debounceTime(350),                 // aguarda o usuário parar de digitar
        distinctUntilChanged(),            // ignora buscas repetidas em sequência
        filter((term) => term !== null && term !== undefined), // descarta valores inválidos
        switchMap((term) => {
          this.loadingVehicles = true;
          return this.vehicleService.getVehicles().pipe(
            map((vehicles) =>
              vehicles.filter((v) =>
                v.model.toLowerCase().includes(term.trim().toLowerCase())
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
   * Pipeline reativo da Busca 2 (tabela por código do veículo).
   * Operadores exigidos: debounceTime, distinctUntilChanged, filter, map.
   */
  private setupCodeSearch(): void {
    const sub = this.codeSearch$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        filter((term) => term !== null && term !== undefined),
        switchMap((term) => {
          this.loadingTable = true;
          return this.vehicleService.getVehicleData().pipe(
            map((rows) =>
              rows.filter((row) =>
                row.code.toLowerCase().includes(term.trim().toLowerCase())
              )
            )
          );
        })
      )
      .subscribe({
        next: (rows) => {
          this.vehicleDataRows = rows;
          this.loadingTable = false;
        },
        error: () => {
          this.loadingTable = false;
          this.vehicleDataRows = [];
        }
      });

    this.subscriptions.add(sub);
  }

  /** Disparado pelo (ngModelChange) do campo de busca por modelo. */
  onModelSearchChange(term: string): void {
    this.modelSearch$.next(term);
  }

  /** Disparado pelo (ngModelChange) do campo de busca por código. */
  onCodeSearchChange(term: string): void {
    this.codeSearch$.next(term);
  }

  /** Atualiza reativamente os cards e a imagem central. */
  selectVehicle(vehicle: Vehicle): void {
    this.selectedVehicle = vehicle;
  }

  statusBadgeClass(status: string): string {
    const normalized = status.toLowerCase();
    if (normalized.includes('conect')) return 'badge-status badge-status--online';
    if (normalized.includes('manuten')) return 'badge-status badge-status--warning';
    return 'badge-status badge-status--offline';
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
