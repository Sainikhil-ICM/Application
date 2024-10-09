import { Controller, Get } from '@nestjs/common';
import * as kebabCase from 'lodash/kebabCase';
import backendResources from 'src/database/resources/backend';
import partnerResources from 'src/database/resources/partner';

@Controller('docs')
export class DocsController {
    @Get('partner')
    getPartnerResources() {
        return {
            success: true,
            data: partnerResources.map((resource) => ({
                ...resource,
                endpoints: resource.endpoints.map((endpoint) => ({
                    ...endpoint,
                    anchor: kebabCase(endpoint.title),
                })),
            })),
        };
    }

    @Get('partner/nav')
    getPartnerNav() {
        return {
            success: true,
            data: partnerResources.map((resource) => ({
                title: resource.name,
                path: resource.path,
                endpoints: resource.endpoints.map((endpoint) => ({
                    title: endpoint.title,
                    method: endpoint.method,
                    anchor: kebabCase(endpoint.title),
                })),
            })),
        };
    }

    @Get('backend')
    getBackendResources() {
        return {
            success: true,
            data: backendResources.map((resource) => ({
                ...resource,
                endpoints: resource.endpoints.map((endpoint) => ({
                    ...endpoint,
                    anchor: kebabCase(endpoint.title),
                })),
            })),
        };
    }

    @Get('backend/nav')
    getBackendNav() {
        return {
            success: true,
            data: backendResources.map((resource) => ({
                title: resource.name,
                path: resource.path,
                endpoints: resource.endpoints.map((endpoint) => ({
                    title: endpoint.title,
                    method: endpoint.method,
                    anchor: kebabCase(endpoint.title),
                })),
            })),
        };
    }
}
