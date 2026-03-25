import { IsString } from 'class-validator';

export class CreateReportDto {
  @IsString()
  targetType!: string;

  @IsString()
  targetId!: string;

  @IsString()
  reason!: string;
}
