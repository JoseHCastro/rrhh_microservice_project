import { Global, Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { GeminiProvider } from './gemini.provider';
import { IA_PROVIDER } from './ia.types';

/**
 * Módulo de IA. El provider se inyecta por el token IA_PROVIDER, así que
 * cambiar Gemini → Azure OpenAI es cambiar UNA línea aquí.
 */
@Global()
@Module({
  providers: [
    GeminiProvider,
    { provide: IA_PROVIDER, useExisting: GeminiProvider },
    IaService,
  ],
  exports: [IaService],
})
export class IaModule {}
