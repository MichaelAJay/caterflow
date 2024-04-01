/**
 * This interface should only expose GET paths
 */
export interface IIntegrationController {
  getIntegrations(): Promise<any>;
}
