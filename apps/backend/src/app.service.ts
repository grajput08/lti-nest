import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  // Example: How to use PrismaService in your services
  // async findAllUsers() {
  //   return this.prisma.user.findMany();
  // }
}
