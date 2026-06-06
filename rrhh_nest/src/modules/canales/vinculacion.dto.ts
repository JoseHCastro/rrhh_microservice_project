import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TipoCanal } from '@prisma/client';

export class GenerarVinculacionDto {
  @IsEnum(TipoCanal)
  tipoCanal!: TipoCanal;
}

export class ConfirmarVinculacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  codigo!: string;

  @IsEnum(TipoCanal)
  tipoCanal!: TipoCanal;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  identificadorCanal!: string;
}
