import { Injectable } from '@nestjs/common';
import { IIntegrationsMapper } from './interfaces/integrations-mapper.service.interface';

@Injectable()
export class IntegrationsMapperService implements IIntegrationsMapper {}
