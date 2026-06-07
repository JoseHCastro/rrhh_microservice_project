import { Module } from '@nestjs/common';
import { GruposResolver } from './grupos.resolver';
import { GruposService } from './grupos.service';

@Module({
  providers: [GruposService, GruposResolver],
  exports: [GruposService],
})
export class GruposModule {}
