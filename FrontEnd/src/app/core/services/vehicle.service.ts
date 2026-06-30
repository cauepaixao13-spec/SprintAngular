import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Vehicle, VehicleData } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private readonly vehicleUrl = 'http://localhost:3000/vehicle';
  private readonly vehicleDataUrl = 'http://localhost:3000/vehicleData';

  // shareReplay evita múltiplas requisições HTTP repetidas para os mesmos
  // dados quando vários componentes/observables se inscrevem na mesma fonte.
  private readonly vehicles$: Observable<Vehicle[]>;
  private readonly vehicleData$: Observable<VehicleData[]>;

  constructor(private http: HttpClient) {
    this.vehicles$ = this.http.get<Vehicle[]>(this.vehicleUrl).pipe(shareReplay(1));
    this.vehicleData$ = this.http.get<VehicleData[]>(this.vehicleDataUrl).pipe(shareReplay(1));
  }

  /** Busca 1: lista completa de veículos (endpoint /vehicle). */
  getVehicles(): Observable<Vehicle[]> {
    return this.vehicles$;
  }

  /**
   * Extrai somente os nomes/modelos dos veículos.
   * Equivale ao operador "pluck" (descontinuado no RxJS >= 7),
   * substituído pela forma moderna recomendada: map(item => item.prop).
   */
  getVehicleModels(): Observable<string[]> {
    return this.vehicles$.pipe(
      map((vehicles) => vehicles.map((v) => v.model)) // alternativa moderna ao pluck('model')
    );
  }

  /** Busca 2 / Tabela: dados detalhados dos veículos (endpoint /vehicleData). */
  getVehicleData(): Observable<VehicleData[]> {
    return this.vehicleData$;
  }
}
