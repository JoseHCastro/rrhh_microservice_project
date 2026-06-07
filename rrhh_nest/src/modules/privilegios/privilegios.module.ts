import { Module } from '@nestjs/common';
import { PrivilegiosResolver } from './privilegios.resolver';
import { PrivilegiosService } from './privilegios.service';

@Module({
  providers: [PrivilegiosService, PrivilegiosResolver],
  exports: [PrivilegiosService],
})
export class PrivilegiosModule {}
