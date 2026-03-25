import { Body, Controller, Get, Post, UploadedFiles, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateVerificationRequestDto } from './dto';
import { VerificationService } from './verification.service';

const allowedMime = new Set(['application/pdf', 'image/jpeg', 'image/png']);

@Controller('verification-requests')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@CurrentUser() user: { sub: string }) {
    return this.verificationService.mine(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('documents', 5, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, callback) => {
        if (!allowedMime.has(file.mimetype)) return callback(new BadRequestException('Invalid file type'), false);
        callback(null, true);
      },
    }),
  )
  create(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateVerificationRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.verificationService.create(user.sub, dto, files);
  }
}
