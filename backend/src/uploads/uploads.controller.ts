import {
  BadRequestException,
  Controller,
  Delete,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MinioService } from './minio.service';
import { Roles } from '../auth/rbac/roles.decorator';
import { Role } from '../auth/rbac/role.enum';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = /^image\/(jpe?g|png|webp|gif|avif)$/;

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly minioService: MinioService) {}

  @Post('image')
  @Roles(Role.Admin, Role.Seller)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_BYTES } }),
  )
  @ApiOperation({ summary: 'Upload a product image to MinIO' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        objectName: { type: 'string' },
      },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided (field name: "file")');
    }
    if (!ALLOWED_MIME.test(file.mimetype)) {
      throw new BadRequestException(
        'Unsupported file type. Allowed: jpg, jpeg, png, webp, gif, avif',
      );
    }
    return this.minioService.uploadImage(file);
  }

  @Delete('image')
  @Roles(Role.Admin, Role.Seller)
  @ApiOperation({ summary: 'Delete a previously uploaded image from MinIO' })
  @ApiResponse({ status: 200, description: 'Image deleted' })
  async deleteImage(@Query('objectName') objectName: string) {
    if (!objectName) {
      throw new BadRequestException('objectName query param is required');
    }
    await this.minioService.deleteImage(objectName);
    return { message: 'Image deleted' };
  }
}
