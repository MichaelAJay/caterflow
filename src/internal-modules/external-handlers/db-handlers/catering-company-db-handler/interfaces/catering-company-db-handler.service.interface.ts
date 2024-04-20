import { CateringCompany } from '@prisma/client';

export interface ICateringCompanyDbHandler {
  createCateringCompany(
    name: string,
    ownerId: string,
  ): Promise<CateringCompany>;
}
