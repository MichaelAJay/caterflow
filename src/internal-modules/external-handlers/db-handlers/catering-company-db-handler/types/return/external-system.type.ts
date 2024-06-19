import { ExternalSystem, IntegrationTemplate } from '@prisma/client';
import { ExternalSystemRequirements } from '../external_systems_requirements';

export type ExternalSystemWithTypedRequirements = Omit<
  ExternalSystem,
  'requirements'
> & {
  requirements: ExternalSystemRequirements;
};

export type ExternalSystemWithTypedRequirementsAndIntegrations =
  ExternalSystemWithTypedRequirements & {
    srcFor: IntegrationTemplate[];
    targetFor: IntegrationTemplate[];
  };

export type ExternalSystemWithTypeRequirementsAndIntegrationsAndCompanyReference =
  ExternalSystemWithTypedRequirementsAndIntegrations & {
    connectionId?: string;
  };
