import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { Vehicle, VehicleData, VehiclesApiResponse } from '../models/vehicle.model';
import { ApiErrorResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  // API real do desafio: https://github.com/JMarcelloDias/Api-Sprint7
  private readonly vehiclesUrl = 'http://localhost:3001/vehicles';
  private readonly vehicleDataUrl = 'http://localhost:3001/vehicleData';

  // shareReplay evita múltiplas requisições HTTP repetidas para os mesmos
  // dados quando vários componentes/observables se inscrevem na mesma fonte.
  private readonly vehicles$: Observable<Vehicle[]>;

  constructor(private http: HttpClient) {
    this.vehicles$ = this.http.get<VehiclesApiResponse>(this.vehiclesUrl).pipe(
      map((response) => response.vehicles), // a API envelopa o array em { vehicles: [...] }
      shareReplay(1)
    );
  }

  /** Busca 1: lista completa de veículos (endpoint GET /vehicles). */
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
      map((vehicles) => vehicles.map((v) => v.vehicle)) // alternativa moderna ao pluck('vehicle')
    );
  }

  /**
   * Busca 2 / Tabela: busca um único veículo pelo código VIN
   * (endpoint POST /vehicleData). Retorna `null` quando o VIN não existe,
   * em vez de propagar o erro HTTP, para facilitar o tratamento no componente.
   */
  searchVehicleByVin(vin: string): Observable<VehicleData | null> {
    return this.http.post<VehicleData>(this.vehicleDataUrl, { vin }).pipe(
      catchError((error: HttpErrorResponse) => {
        const apiMessage = (error.error as ApiErrorResponse)?.message;
        console.warn(apiMessage ?? 'VIN não encontrado.');
        return of(null);
      })
    );
  }
}
