export const mockPrismaClientService = {
  onModuleInit: jest.fn(),
  account: {
    create: jest.fn(),
  },
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};
