import { IsOptional, IsString } from 'class-validator';

export class CreateVerificationRequestDto {
  @IsString()
  institutionId!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
