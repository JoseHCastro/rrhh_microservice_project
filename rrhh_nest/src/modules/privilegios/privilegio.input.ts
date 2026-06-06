import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CrearPrivilegioInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  codigo!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  modulo!: string;
}

@InputType()
export class ActualizarPrivilegioInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  modulo?: string;
}
