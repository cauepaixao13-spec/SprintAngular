/**
 * Modelo de usuário, baseado no que o back-end (json-server / API REST)
 * em http://localhost:3000/users deve retornar.
 */
export interface User {
  id?: number;
  username: string;
  password: string;
  name?: string;
  role?: string;
}

/**
 * Payload enviado pelo formulário de login.
 */
export interface LoginCredentials {
  username: string;
  password: string;
}
