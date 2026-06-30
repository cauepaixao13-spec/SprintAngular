/**
 * Modelos baseados na API real do desafio
 * (https://github.com/JMarcelloDias/Api-Sprint7), rodando em
 * http://localhost:3001.
 */

/**
 * Veículo retornado pelo endpoint GET /vehicles.
 * A API responde no formato { vehicles: Vehicle[] }.
 */
export interface Vehicle {
  id: number;
  vehicle: string;          // nome do modelo. Ex: "Mustang"
  volumetotal: number;      // Total de vendas
  connected: number;        // Veículos conectados
  softwareUpdates: number;  // Update Software
  img: string;              // URL completa da imagem (já vem com http://localhost:3001/...)
}

/** Envelope retornado por GET /vehicles. */
export interface VehiclesApiResponse {
  vehicles: Vehicle[];
}

/**
 * Dado retornado pelo endpoint POST /vehicleData.
 * Corpo enviado: { vin: string }
 * A API retorna um ÚNICO objeto (não uma lista) quando o VIN é
 * encontrado, ou erro 400 com { message } quando não é.
 */
export interface VehicleData {
  id: number;
  odometro: number;          // Odômetro (Km)
  nivelCombustivel: number;  // Nível de combustível (%)
  status: string;            // "on" | "off"
  lat: number;
  long: number;
}

/** Linha exibida na tabela: o resultado da API + o VIN buscado (que não vem na resposta). */
export interface VehicleDataRow extends VehicleData {
  vin: string;
}
