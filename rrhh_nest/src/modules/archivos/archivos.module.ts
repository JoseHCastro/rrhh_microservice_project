import { Module } from '@nestjs/common';
import { ArchivosResolver } from './archivos.resolver';
import { ArchivosService } from './archivos.service';

@Module({
  providers: [ArchivosService, ArchivosResolver],
  exports: [ArchivosService],
})
export class ArchivosModule {}
