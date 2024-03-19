export interface ICateringCompanyService {
  /**
   * @param name company name
   * @param ownerId owner internal user.id
   */
  createCateringCompany(name: string, ownerId: string): Promise<any>;
}
