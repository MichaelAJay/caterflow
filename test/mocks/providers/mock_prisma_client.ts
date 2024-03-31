export const mockPrismaClientService = {
  onModuleInit: jest.fn(),
  cateringCompany: {
    create: jest.fn(),
  },
  role: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  userCompanyRole: {
    create: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  userSystemAction: {
    create: jest.fn(),
    createMany: jest.fn(),
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};
