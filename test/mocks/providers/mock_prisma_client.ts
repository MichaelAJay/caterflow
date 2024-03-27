export const mockPrismaClientService = {
  onModuleInit: jest.fn(),
  cateringCompany: {
    create: jest.fn(),
  },
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  userSystemAction: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};
