import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum AdminApprovalAction {
  approve = 'approve',
  reject = 'reject',
}

export class ReviewUserDto {
  @IsEnum(AdminApprovalAction)
  action!: AdminApprovalAction;

  @IsOptional()
  @IsString()
  reason?: string;
}
