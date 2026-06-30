import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withViewTransitions habilita uma transição suave (fade) nativa do
    // navegador entre as trocas de rota (Login -> Home -> Dashboard),
    // usando a View Transitions API (sem precisar do pacote @angular/animations).
    provideRouter(routes, withViewTransitions()),
    provideHttpClient()
  ]
};
