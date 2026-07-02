import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // provideZoneChangeDetection ativa a detecção de mudanças baseada em
    // zone.js com coalescing de eventos, garantindo que a tela seja
    // atualizada automaticamente assim que respostas assíncronas (HTTP,
    // setTimeout, promises) chegam — sem depender de um clique manual.
    provideZoneChangeDetection({ eventCoalescing: true }),
    // withViewTransitions habilita uma transição suave (fade) nativa do
    // navegador entre as trocas de rota (Login -> Home -> Dashboard),
    // usando a View Transitions API (sem precisar do pacote @angular/animations).
    provideRouter(routes, withViewTransitions()),
    provideHttpClient()
  ]
};
