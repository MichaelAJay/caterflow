import { Injectable } from '@nestjs/common';
import { IIntegrationsMapper } from './interfaces/integrations-mapper.service.interface';
import { ExternalSystemWithTypedRequirementsAndIntegrations } from '../external-handlers/db-handlers/catering-company-db-handler/types/return/external-system.type';

type ExternalSystemResponse = Omit<
  ExternalSystemWithTypedRequirementsAndIntegrations,
  'name' | 'uiName' | 'uiDescription' | 'requirements' | 'srcFor' | 'targetFor'
> & {
  name: string;
  description: string;
  srcFor: { name: string; description: string }[];
  targetFor: { name: string; description: string }[];
};

@Injectable()
export class IntegrationsMapperService implements IIntegrationsMapper {
  mapExternalSystemsForResponse(
    externalSystems: ExternalSystemWithTypedRequirementsAndIntegrations[],
  ): ExternalSystemResponse[] {
    return externalSystems.map(
      ({
        id,
        uiName: name,
        uiDescription: description,
        srcFor,
        targetFor,
      }) => ({
        id,
        name,
        description,
        srcFor: srcFor.map(({ uiName: name, uiDescription: description }) => ({
          name,
          description,
        })),
        targetFor: targetFor.map(
          ({ uiName: name, uiDescription: description }) => ({
            name,
            description,
          }),
        ),
      }),
    );
  }
}
