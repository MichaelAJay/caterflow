export const mockPrismaClientService = {
  onModuleInit: jest.fn(),
  company: {
    create: jest.fn(),
  },
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};
