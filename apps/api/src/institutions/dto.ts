import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateInstitutionRequestDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsString()
  @Length(2, 2)
  countryCode!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsBoolean()
  isPublic!: boolean;
}
