/**
 * Modelo principal do veículo.
 * Consumido em GET http://localhost:3000/vehicle
 * Usado na Busca 1 do Dashboard (busca reativa por modelo) e nos
 * 3 cards de indicadores (Total de vendas / Veículos conectados / Software atualizado).
 */
export interface Vehicle {
  id: number;
  model: string;
  brand: string;
  image: string;
  totalSales: number;
  connectedVehicles: number;
  softwareUpdated: number; // percentual (0-100) de veículos com software atualizado
  description?: string;
}

/**
 * Modelo dos dados detalhados de cada veículo (linha da tabela).
 * Consumido em GET http://localhost:3000/vehicleData
 * Usado na Busca 2 do Dashboard (busca por código do veículo).
 *
 * 5 colunas exibidas na tabela: code, model, status, lastUpdate, location
 */
export interface VehicleData {
  id: number;
  code: string;        // ex: 2FRHDUYS2Y63NHD22454
  model: string;
  status: string;       // ex: "Conectado", "Offline", "Em manutenção"
  lastUpdate: string;    // ex: "2026-06-28"
  location: string;     // ex: "Fortaleza - CE"
}
