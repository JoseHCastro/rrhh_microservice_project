import { Global, Module } from '@nestjs/common';
import { BitacoraResolver } from './bitacora.resolver';
import { BitacoraService } from './bitacora.service';

@Global()
@Module({
  providers: [BitacoraService, BitacoraResolver],
  exports: [BitacoraService],
})
export class BitacoraModule {}
