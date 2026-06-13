import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(HealthService);
  });

  it('returns application health metadata', () => {
    expect(service.getStatus()).toMatchObject({
      environment: 'test',
      status: 'ok',
    });
  });
});
