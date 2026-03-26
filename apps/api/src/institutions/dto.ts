import { IsBoolean, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export enum InstitutionApprovalAction {
  approve = 'approve',
  reject = 'reject',
}

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

export class ReviewInstitutionRequestDto {
  @IsEnum(InstitutionApprovalAction)
  action!: InstitutionApprovalAction;

  @IsOptional()
  @IsString()
  reason?: string;
}
