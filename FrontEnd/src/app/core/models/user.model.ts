/**
 * Modelo de usuário, baseado na API real do desafio
 * (https://github.com/JMarcelloDias/Api-Sprint7).
 *
 * Endpoint: POST http://localhost:3001/login
 * Corpo enviado: { nome, senha }
 * Resposta de sucesso (200): { id, nome, email }
 * Resposta de erro (400/401): { message }
 */

/** Payload capturado no formulário de login (nomes em inglês para o código TS). */
export interface LoginCredentials {
  username: string;
  password: string;
}

/** Corpo exato esperado pela API (nomes em português). */
export interface LoginApiPayload {
  nome: string;
  senha: string;
}

/** Resposta de sucesso da API de login. */
export interface LoginApiResponse {
  id: number;
  nome: string;
  email: string;
}

/** Resposta de erro padrão da API. */
export interface ApiErrorResponse {
  message: string;
}
