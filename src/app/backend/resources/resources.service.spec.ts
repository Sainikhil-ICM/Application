// nest.js testing imports
import { Test, TestingModule } from '@nestjs/testing';

// mongo connection imports
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MockUploadService, closeInMongodConnection, rootMongooseTestModule } from 'test/utils';

// services & modules dependencies imports
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ResourcesService } from './resources.service';
import AttachmentService from 'src/services/attachment.service';

// mongoose models imports
import { Model, Types } from 'mongoose';
import { Resource, ResourceDocument, ResourceSchema } from 'src/models/resource.model';
import { Attachment, AttachmentDocument, AttachmentSchema } from 'src/models/attachment.model';
import { CustomerAttachment, CustomerAttachmentSchema } from 'src/models/customer-attachment.model';
import {
    ResourceRoleGroup,
    ResourceRoleGroupDocument,
    ResourceRoleGroupSchema,
} from 'src/models/resource-role-group.model';
import { SessionUser } from 'src/constants/user.const';

// other imports
import { AccessControlList } from 'src/constants/access-control.const';
import {
    ResourceCategory,
    ResourceStatus,
    ResourceSubCategory,
    ResourceType,
} from 'src/constants/resource.const';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResProps1 } from 'types';
import { File } from 'buffer';
import { Readable } from 'stream';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { User, UserDocument, UserSchema } from 'src/models/user.model';
import { ResourcesRepository } from './resources.repository';

describe('Resources Service', () => {
    // common objects used in tests
    let service: ResourcesService;
    let mockResourceModel: Partial<Model<ResourceDocument>>;
    let mockResourceRoleGroupModel: Partial<Model<ResourceRoleGroupDocument>>;
    let mockAttachmentModel: Partial<Model<AttachmentDocument>>;
    let mockUserModel: Partial<Model<UserDocument>>;

    const getMockUserSession = (roles: AccessControlList[] | string[]): SessionUser => {
        return {
            sub: 'MAIN',
            // @ts-ignore
            user_id: new Types.ObjectId(),
            // @ts-ignore
            account_id: new Types.ObjectId(),
            roles: roles as AccessControlList[],
        };
    };
    // setup for tests
    beforeAll((done) => {
        Test.createTestingModule({
            imports: [
                rootMongooseTestModule(),
                HttpModule,
                MongooseModule.forFeature([
                    { name: Attachment.name, schema: AttachmentSchema },
                    { name: CustomerAttachment.name, schema: CustomerAttachmentSchema },
                    { name: Resource.name, schema: ResourceSchema },
                    { name: ResourceRoleGroup.name, schema: ResourceRoleGroupSchema },
                    { name: User.name, schema: UserSchema },
                ]),
            ],
            providers: [
                ResourcesService,
                AttachmentService,
                MockUploadService,
                ConfigService,
                ResourcesRepository,
            ],
        })
            .compile()
            .then((module) => {
                service = module.get<ResourcesService>(ResourcesService);
                mockResourceModel = module.get(getModelToken(Resource.name));
                mockResourceRoleGroupModel = module.get(getModelToken(ResourceRoleGroup.name));
                mockAttachmentModel = module.get(getModelToken(Attachment.name));
                mockUserModel = module.get(getModelToken(User.name));
                done();
            });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        return await closeInMongodConnection();
    });
    const getStandardResourceBody = (): CreateResourceDto => ({
        name: 'Test',
        status: ResourceStatus.ACTIVE,
        resource_category: ResourceCategory.AMC,
        resource_sub_category: ResourceSubCategory.SID,
        role_groups: '["_ACCOUNT_ADMIN", "_RELATIONSHIP_ADVISOR"]',
        type: ResourceType.LINK,
        link: 'https://incredmoney.com',
    });
    const getStandardResourceDocument = () => {
        return {
            name: 'Test',
            status: ResourceStatus.ACTIVE,
            category: ResourceCategory.AMC,
            sub_category: ResourceSubCategory.SID,
            type: ResourceType.LINK,
            link: 'https://incredmoney.com',
        };
    };

    /* ----------------------- TEST MODULES ---------------------- */
    describe('Create Resource', () => {
        beforeEach(async () => {
            // clean any prior data
            await mockResourceModel.deleteMany();
            await mockResourceRoleGroupModel.deleteMany();
        });

        /* --------------------- TEST CASES ---------------------- */
        it('fails to create resource of invalid type', async () => {
            // arrange
            const userSession = getMockUserSession([...Object.values(AccessControlList)]); // full-access
            const createResourceBody = getStandardResourceBody();

            // act
            const createResourceResponse = (await service.createResource(userSession, {
                ...createResourceBody,
                // @ts-ignore
                type: 'RANDOM',
            })) as {
                success: boolean;
                errors: string[];
            };

            // assert
            const totalResources = await mockResourceModel.find({});
            expect(totalResources.length).toBe(0);
            expect(createResourceResponse.success).toBe(false);
            expect(createResourceResponse.errors?.[0]).toMatch(/Invalid resource type/i);
        });

        it('fails to create link type resource without a link', async () => {
            // arrange
            const userSession = getMockUserSession([...Object.values(AccessControlList)]); // full-access
            const createResourceBody = getStandardResourceBody();

            // act
            const createResourceResponse = (await service.createResource(userSession, {
                ...createResourceBody,
                type: ResourceType.LINK,
                link: undefined,
            })) as {
                success: boolean;
                errors: string[];
            };

            // assert
            const totalResources = await mockResourceModel.find({});
            expect(totalResources.length).toBe(0);
            expect(createResourceResponse.success).toBe(false);
            expect(createResourceResponse.errors?.[0]).toMatch(
                /Link type resource should have a link/i,
            );
        });

        it('fails to create resource with invalid category', async () => {
            // arrange
            const userSession = getMockUserSession([...Object.values(AccessControlList)]); // full-access
            const createResourceBody = getStandardResourceBody();

            // act
            const createResourceResponse = (await service.createResource(userSession, {
                ...createResourceBody,
                // @ts-ignore
                resource_category: 'RANDOM',
            })) as {
                success: boolean;
                errors: string[];
            };

            // assert
            const totalResources = await mockResourceModel.find({});
            expect(totalResources.length).toBe(0);
            expect(createResourceResponse.success).toBe(false);
            expect(createResourceResponse.errors?.[0]).toMatch(/Invalid resource category/i);
        });

        it('fails to create resource with invalid sub category', async () => {
            // arrange
            const userSession = getMockUserSession([...Object.values(AccessControlList)]); // full-access
            const createResourceBody = getStandardResourceBody();

            // act
            const createResourceResponse = (await service.createResource(userSession, {
                ...createResourceBody,
                // @ts-ignore
                resource_sub_category: 'RANDOM',
            })) as {
                success: boolean;
                errors: string[];
            };

            // assert
            const totalResources = await mockResourceModel.find({});
            expect(totalResources.length).toBe(0);
            expect(createResourceResponse.success).toBe(false);
            expect(createResourceResponse.errors?.[0]).toMatch(/Invalid resource sub category/i);
        });

        it('fails to create resource with unrelated sub category', async () => {
            // arrange
            const userSession = getMockUserSession([...Object.values(AccessControlList)]); // full-access
            const createResourceBody = getStandardResourceBody();

            // act
            const createResourceResponse = (await service.createResource(userSession, {
                ...createResourceBody,
                resource_sub_category: ResourceSubCategory.PMS_FACTSHEET,
            })) as {
                success: boolean;
                errors: string[];
            };

            // assert
            const totalResources = await mockResourceModel.find({});
            expect(totalResources.length).toBe(0);
            expect(createResourceResponse.success).toBe(false);
            expect(createResourceResponse.errors?.[0]).toMatch(/Invalid resource sub category/i);
        });

        it('fails to create resource with invalid status', async () => {
            // arrange
            const userSession = getMockUserSession([...Object.values(AccessControlList)]); // full-access
            const createResourceBody = getStandardResourceBody();

            // act
            const createResourceResponse = (await service.createResource(userSession, {
                ...createResourceBody,
                // @ts-ignore
                status: 'RANDOM',
            })) as {
                success: boolean;
                errors: string[];
            };

            // assert
            const totalResources = await mockResourceModel.find({});
            expect(totalResources.length).toBe(0);
            expect(createResourceResponse.success).toBe(false);
            expect(createResourceResponse.errors?.[0]).toMatch(/Invalid resource status/i);
        });

        it('successfully creates a link type resource', async () => {
            // arrange
            const userSession = getMockUserSession([...Object.values(AccessControlList)]); // full-access
            const createResourceBody = getStandardResourceBody();

            // act
            const createResourceResponse = (await service.createResource(
                userSession,
                createResourceBody,
            )) as {
                success: boolean;
                data: ResourceDocument;
                message: string;
            };

            // assert
            // expect success
            expect(createResourceResponse.success).toBe(true);

            // expect 1 resource to be created matching the input body
            expect(createResourceResponse.data).toMatchObject({
                name: createResourceBody.name,
                status: createResourceBody.status,
                category: createResourceBody.resource_category,
                sub_category: createResourceBody.resource_sub_category,
                type: createResourceBody.type,
                link: createResourceBody.link,
            });

            const createdResources = await mockResourceModel.find({});
            expect(createdResources.length).toBe(1);

            const createdResource = createdResources[0];
            expect(createdResource).toMatchObject({
                name: createResourceBody.name,
                status: createResourceBody.status,
                category: createResourceBody.resource_category,
                sub_category: createResourceBody.resource_sub_category,
                type: createResourceBody.type,
                link: createResourceBody.link,
            });

            // expect accurate resource role groups to be created
            const inputRoleGroups = JSON.parse(createResourceBody.role_groups);
            const createdResourceRoleGroups = await mockResourceRoleGroupModel.find({});
            expect(createdResourceRoleGroups.length).toBe(inputRoleGroups.length);

            for (const inputRoleGroup of inputRoleGroups) {
                const matchingCreatedResourceRoleGroup = createdResourceRoleGroups.filter(
                    (resourceRoleGroup) =>
                        resourceRoleGroup.role_group_type === inputRoleGroup &&
                        resourceRoleGroup.resource_id === createdResource.id &&
                        resourceRoleGroup.account_id === userSession.account_id,
                );
                expect(matchingCreatedResourceRoleGroup).toBeDefined();
            }
        });

        it('successfully creates a document type resource', async () => {
            // arrange
            const userSession = getMockUserSession([...Object.values(AccessControlList)]); // full-access
            const createResourceBody: CreateResourceDto = {
                ...getStandardResourceBody(),
                type: ResourceType.DOCUMENT,
                link: undefined,
            };

            // act
            const createResourceResponse = (await service.createResource(userSession, {
                ...createResourceBody,
            })) as {
                success: boolean;
                data: ResourceDocument;
                message: string;
            };

            // assert
            // expect success
            expect(createResourceResponse.success).toBe(true);

            // expect 1 resource to be created matching the input body
            expect(createResourceResponse.data).toMatchObject({
                name: createResourceBody.name,
                status: createResourceBody.status,
                category: createResourceBody.resource_category,
                sub_category: createResourceBody.resource_sub_category,
                type: createResourceBody.type,
                link: createResourceBody.link,
            });

            const createdResources = await mockResourceModel.find({});
            expect(createdResources.length).toBe(1);

            const createdResource = createdResources[0];
            expect(createdResource).toMatchObject({
                name: createResourceBody.name,
                status: createResourceBody.status,
                category: createResourceBody.resource_category,
                sub_category: createResourceBody.resource_sub_category,
                type: createResourceBody.type,
                link: createResourceBody.link,
            });

            // expect accurate resource role groups to be created
            const inputRoleGroups = JSON.parse(createResourceBody.role_groups);
            const createdResourceRoleGroups = await mockResourceRoleGroupModel.find({});
            expect(createdResourceRoleGroups.length).toBe(inputRoleGroups.length);

            for (const inputRoleGroup of inputRoleGroups) {
                const matchingCreatedResourceRoleGroup = createdResourceRoleGroups.filter(
                    (resourceRoleGroup) =>
                        resourceRoleGroup.role_group_type === inputRoleGroup &&
                        resourceRoleGroup.resource_id === createdResource.id &&
                        resourceRoleGroup.account_id === userSession.account_id,
                );
                expect(matchingCreatedResourceRoleGroup).toBeDefined();
            }
        });
    });

    describe('Create Resource With Attachment', () => {
        beforeEach(async () => {
            // clean any prior data
            await mockResourceModel.deleteMany();
            await mockResourceRoleGroupModel.deleteMany();
        });
        const getStandardResourceBody = (): CreateResourceDto => ({
            name: 'Test',
            status: ResourceStatus.ACTIVE,
            resource_category: ResourceCategory.AMC,
            resource_sub_category: ResourceSubCategory.SID,
            role_groups: '["_ACCOUNT_ADMIN", "_RELATIONSHIP_ADVISOR"]',
            type: ResourceType.LINK,
            link: 'https://www.google.com',
        });
        it('successfully creates a resource without attachment', async () => {
            jest.spyOn(service, 'createResource');
            const userSession = getMockUserSession([...Object.values(AccessControlList)]); // full-access
            const createResourceBody = getStandardResourceBody();
            const createResourceResponse = (await service.createResourceWithAttachments(
                userSession,
                {
                    ...createResourceBody,
                },
                [],
            )) as {
                success: boolean;
                data: ResourceDocument;
                message: string;
            };
            expect(service.createResource).toHaveBeenCalledWith(userSession, createResourceBody);
            expect(createResourceResponse.success).toBe(true);
            const createdResource = createResourceResponse.data;
            expect(createdResource).toMatchObject({
                name: createResourceBody.name,
                status: createResourceBody.status,
                category: createResourceBody.resource_category,
                sub_category: createResourceBody.resource_sub_category,
                type: createResourceBody.type,
                link: createResourceBody.link,
            });
            const createdResourceDocument = (
                await mockResourceModel.find({ _id: createdResource.id })
            )[0];
            expect(createdResourceDocument.attachment_id).toBeUndefined();
        });
        it('successfully creates a resource with attachment', async () => {
            jest.spyOn(service, 'createResource');
            const userSession = getMockUserSession([...Object.values(AccessControlList)]); // full-access
            const createResourceBody = getStandardResourceBody();
            const mockFile: Express.Multer.File = getMockExpressMulterFile();
            const createResourceResponse = (await service.createResourceWithAttachments(
                userSession,
                {
                    ...createResourceBody,
                },
                [mockFile],
            )) as {
                success: boolean;
                data: ResourceDocument;
                message: string;
            };
            expect(service.createResource).toHaveBeenCalledWith(userSession, createResourceBody);
            expect(createResourceResponse.success).toBe(true);
            const createdResource = createResourceResponse.data;
            expect(createdResource).toMatchObject({
                name: createResourceBody.name,
                status: createResourceBody.status,
                category: createResourceBody.resource_category,
                sub_category: createResourceBody.resource_sub_category,
                type: createResourceBody.type,
                link: createResourceBody.link,
            });
            const createdResourceDocument = (
                await mockResourceModel.find({ _id: createdResource.id })
            )[0];
            expect(createdResourceDocument.attachment_id).toBeDefined();
            const createdAttachmentDocument = await mockAttachmentModel.findById(
                createdResourceDocument.attachment_id,
            );
            expect(createdAttachmentDocument).toBeDefined();
            expect(createdAttachmentDocument.name).toBe(mockFile.originalname);
        });
    });

    describe('Get Resources', () => {
        const ADMIN_USRE_ROLE_TYPE = '_ACCOUNT_ADMIN';
        const REGIONAL_MANAGER_ROLE_TYPE = '_REGIONAL_MANAGER';
        let adminUserSession;
        let managerUserSession;
        let standardResource: ResourceDocument;
        let resourceNamedApple: ResourceDocument;
        let arnRecruitmentVideoResource: ResourceDocument;
        let inactiveResource: ResourceDocument;
        let adminOnlyResource: ResourceDocument;
        let allCreatedResources: ResourceDocument[];

        beforeAll(async () => {
            // clean any prior data
            await mockResourceModel.deleteMany();
            await mockResourceRoleGroupModel.deleteMany();
            const adminUser = await mockUserModel.create({
                email: 'sample@sample.com',
            });
            const managerUser = await mockUserModel.create({
                email: 'example@example.com',
            });
            adminUserSession = getMockUserSession([ADMIN_USRE_ROLE_TYPE]);
            managerUserSession = getMockUserSession([REGIONAL_MANAGER_ROLE_TYPE]);
            adminUserSession.user_id = adminUser.id;
            managerUserSession.user_id = managerUser.id;
            managerUserSession.account_id = adminUserSession.account_id;
            // insert new resources to test get resources with
            const standardResourceBody = getStandardResourceDocument();

            standardResource = await mockResourceModel.create({
                ...standardResourceBody,
                user_id: adminUserSession.user_id,
                account_id: adminUserSession.account_id,
            });
            resourceNamedApple = await mockResourceModel.create({
                ...standardResourceBody,
                name: 'Apple',
                category: ResourceCategory.VIDEOS,
                sub_category: ResourceSubCategory.TESTIMONIALS,
                user_id: adminUserSession.user_id,
                account_id: adminUserSession.account_id,
            });
            arnRecruitmentVideoResource = await mockResourceModel.create({
                ...standardResourceBody,
                category: ResourceCategory.VIDEOS,
                sub_category: ResourceSubCategory.TRAINING,
                user_id: adminUserSession.user_id,
                account_id: adminUserSession.account_id,
            });
            inactiveResource = await mockResourceModel.create({
                ...standardResourceBody,
                status: ResourceStatus.INACTIVE,
                user_id: adminUserSession.user_id,
                account_id: adminUserSession.account_id,
            });
            adminOnlyResource = await mockResourceModel.create({
                ...standardResourceBody,
                user_id: adminUserSession.user_id,
                account_id: adminUserSession.account_id,
            });
            allCreatedResources = [
                standardResource,
                resourceNamedApple,
                arnRecruitmentVideoResource,
                inactiveResource,
                adminOnlyResource,
            ];
            for (const resource of [
                standardResource,
                resourceNamedApple,
                arnRecruitmentVideoResource,
                inactiveResource,
            ]) {
                for (const roleGroupType of [ADMIN_USRE_ROLE_TYPE, REGIONAL_MANAGER_ROLE_TYPE]) {
                    await mockResourceRoleGroupModel.create({
                        role_group_type: roleGroupType,
                        resource_id: resource.id,
                        account_id: adminUserSession.account_id,
                    });
                }
            }
            await mockResourceRoleGroupModel.create({
                role_group_type: ADMIN_USRE_ROLE_TYPE,
                resource_id: adminOnlyResource.id,
                account_id: adminUserSession.account_id,
            });
        });
        it("fails to fetch resources users doesn't have access to", async () => {
            // act
            const getResourcesResponse = await service.getResources(managerUserSession, {
                per_page: 10,
                page: 1,
            });

            // assert
            expect(getResourcesResponse.success).toBe(true);
            /**
             * should see all resources except 2:
             * 1. inactive resource &
             * 2. admin only resource
             */
            const expectedResources = allCreatedResources.filter((resource) => {
                return ![adminOnlyResource.id, inactiveResource.id].includes(resource.id);
            });
            expect(getResourcesResponse.data?.collection?.length).toBe(expectedResources.length);
            expect(getResourcesResponse.data.total_count).toBe(expectedResources.length);
            for (const expectedResource of expectedResources) {
                expect(
                    getResourcesResponse.data.collection
                        .map((resource) => resource.id.toString())
                        .includes(expectedResource.id.toString()),
                ).toBe(true);
            }
        });

        it('successfully filters resources based on name search', async () => {
            // act
            const getResourcesResponse = await service.getResources(adminUserSession, {
                per_page: 10,
                page: 1,
                name: 'pple',
            });

            // assert
            expect(getResourcesResponse.success).toBe(true);
            expect(getResourcesResponse.data?.total_count).toBe(1);
            expect(getResourcesResponse.data?.collection?.length).toBe(1);
            expect(getResourcesResponse.data?.collection?.[0].id.toString()).toBe(
                resourceNamedApple.id.toString(),
            );
        });

        it('successfully filters resources based on category', async () => {
            // act
            const getResourcesResponse = await service.getResources(adminUserSession, {
                per_page: 10,
                page: 1,
                category: ResourceCategory.VIDEOS,
            });

            // assert
            const expectedResources = allCreatedResources.filter(
                (resource) => resource.category === ResourceCategory.VIDEOS,
            );
            expect(getResourcesResponse.success).toBe(true);
            expect(getResourcesResponse.data?.total_count).toBe(expectedResources.length);
            expect(getResourcesResponse.data?.collection?.length).toBe(expectedResources.length);
            for (const expectedResource of expectedResources) {
                expect(
                    getResourcesResponse.data.collection
                        .map((resource) => resource.id.toString())
                        .includes(expectedResource.id.toString()),
                ).toBeDefined();
            }
        });

        it('successfully filters resources based on sub category', async () => {
            // act
            const getResourcesResponse = await service.getResources(adminUserSession, {
                per_page: 10,
                page: 1,
                category: ResourceCategory.VIDEOS,
                sub_category: ResourceSubCategory.TRAINING,
            });

            // assert
            const expectedResources = allCreatedResources.filter(
                (resource) =>
                    resource.category === ResourceCategory.VIDEOS &&
                    resource.sub_category === ResourceSubCategory.TRAINING,
            );
            expect(getResourcesResponse.success).toBe(true);
            expect(getResourcesResponse.data?.total_count).toBe(expectedResources.length);
            expect(getResourcesResponse.data?.collection?.length).toBe(expectedResources.length);
            for (const expectedResource of expectedResources) {
                expect(
                    getResourcesResponse.data.collection
                        .map((resource) => resource.id.toString())
                        .includes(expectedResource.id.toString()),
                ).toBeDefined();
            }
        });

        it('successfully filters resources based on status', async () => {
            // act
            const getResourcesResponse = await service.getResources(adminUserSession, {
                per_page: 10,
                page: 1,
                status: ResourceStatus.ACTIVE,
            });

            // assert
            const expectedResources = allCreatedResources.filter(
                (resource) => resource.status === ResourceStatus.ACTIVE,
            );
            expect(getResourcesResponse.success).toBe(true);
            expect(getResourcesResponse.data?.total_count).toBe(expectedResources.length);
            expect(getResourcesResponse.data?.collection?.length).toBe(expectedResources.length);
            for (const expectedResource of expectedResources) {
                expect(
                    getResourcesResponse.data.collection
                        .map((resource) => resource.id.toString())
                        .includes(expectedResource.id.toString()),
                ).toBeDefined();
            }
        });

        it('successfully returns all resources for admin with no filter', async () => {
            // act
            const getResourcesResponse = await service.getResources(adminUserSession, {
                per_page: 10,
                page: 1,
            });

            // assert
            const expectedResources = allCreatedResources;
            expect(getResourcesResponse.success).toBe(true);
            expect(getResourcesResponse.data?.total_count).toBe(expectedResources.length);
            expect(getResourcesResponse.data?.collection?.length).toBe(expectedResources.length);
            for (const expectedResource of expectedResources) {
                expect(
                    getResourcesResponse.data.collection
                        .map((resource) => resource.id.toString())
                        .includes(expectedResource.id.toString()),
                ).toBeDefined();
            }
        });

        it('correctly implements pagination', async () => {
            const per_page = 2;
            let page = 1;
            const expectedNumberOfPages = Math.ceil(allCreatedResources.length / per_page);
            let foundNumberOfPages = 0;
            let foundResources = [];
            while (true) {
                const resourcesPage = await service.getResources(adminUserSession, {
                    per_page,
                    page,
                });

                if (resourcesPage.success) {
                    foundNumberOfPages += 1;
                    foundResources = foundResources.concat(resourcesPage.data.collection);
                } else {
                    break;
                }
                page += 1;
            }
            expect(foundNumberOfPages).toBe(expectedNumberOfPages);
            expect(foundResources.length).toBe(allCreatedResources.length);
            const expectedResources = allCreatedResources;
            for (const expectedResource of expectedResources) {
                expect(
                    foundResources
                        .map((resource) => resource.id.toString())
                        .includes(expectedResource.id.toString()),
                ).toBeDefined();
            }
        });
    });

    describe('Update Resource', () => {
        beforeEach(async () => {
            // clean any prior data
            await mockResourceModel.deleteMany();
            await mockResourceRoleGroupModel.deleteMany();
        });
        it("fails to update resource the user doesn't have access to", async () => {
            // arrange
            const SAMPLE_NON_ADMIN_USER_ROLE_TYPE = '_RELATIONSHIP_MANAGER';
            const ADMIN_USRE_ROLE_TYPE = '_ACCOUNT_ADMIN';
            const userSession = getMockUserSession([SAMPLE_NON_ADMIN_USER_ROLE_TYPE]);
            const createdResource = await mockResourceModel.create({
                name: 'Test Resource',
                status: ResourceStatus.ACTIVE,
                category: ResourceCategory.AMC,
                sub_category: ResourceSubCategory.SID,
                type: ResourceType.LINK,
                link: 'https://incredmoney.com',
                user_id: userSession.user_id,
                account_id: userSession.account_id,
            });
            await mockResourceRoleGroupModel.create({
                role_group_type: ADMIN_USRE_ROLE_TYPE,
                resource_id: createdResource.id,
                account_id: userSession.account_id,
            });

            // act
            const updateResourceResponse = await service.updateResource(
                userSession,
                createdResource.id,
                {
                    name: 'Changed Name',
                },
                [],
            );

            // assert
            expect(updateResourceResponse.success).toBe(false);
            expect(updateResourceResponse.message).toMatch('Unauthorized');
        });

        it('successfully updates the resource', async () => {
            const ADMIN_USRE_ROLE_TYPE = '_ACCOUNT_ADMIN';
            const REGIONAL_MANAGER_ROLE_TYPE = '_REGIONAL_MANAGER';
            const userSession = getMockUserSession([ADMIN_USRE_ROLE_TYPE]);
            const adminUser = await mockUserModel.create({
                email: 'sample@sample.com',
            });
            userSession.user_id = adminUser.id;
            const createdResource = await mockResourceModel.create({
                name: 'Test Resource',
                status: ResourceStatus.ACTIVE,
                category: ResourceCategory.AMC,
                sub_category: ResourceSubCategory.SID,
                type: ResourceType.LINK,
                link: 'https://incredmoney.com',
                user_id: userSession.user_id,
                account_id: userSession.account_id,
            });
            await mockResourceRoleGroupModel.create({
                role_group_type: ADMIN_USRE_ROLE_TYPE,
                resource_id: createdResource.id,
                account_id: userSession.account_id,
            });
            const mockFile = getMockExpressMulterFile();

            // act
            const resourceChanges: UpdateResourceDto = {
                name: 'Changed Name',
                status: ResourceStatus.INACTIVE,
                resource_category: ResourceCategory.PMS,
                resource_sub_category: ResourceSubCategory.PMS_FACTSHEET,
                role_groups: JSON.stringify([REGIONAL_MANAGER_ROLE_TYPE]),
                type: ResourceType.DOCUMENT,
            };
            const updateResourceResponse = (await service.updateResource(
                userSession,
                createdResource.id,
                {
                    ...resourceChanges,
                },
                [mockFile],
            )) as {
                success: boolean;
                data: ResourceDocument;
                message: string;
            };

            // assert
            // return object assertions
            const expectedUpdatedResource = { ...resourceChanges };
            delete expectedUpdatedResource.resource_category;
            delete expectedUpdatedResource.resource_sub_category;
            delete expectedUpdatedResource.role_groups;
            expectedUpdatedResource['category'] = resourceChanges.resource_category;
            expectedUpdatedResource['sub_category'] = resourceChanges.resource_sub_category;
            expect(updateResourceResponse.success).toBe(true);
            const updateResourceResponseData = updateResourceResponse.data;
            expect(updateResourceResponseData).toMatchObject({
                ...expectedUpdatedResource,
            });

            // asserting updated resource document in db
            const updatedResourceDocument = await mockResourceModel.findById(createdResource.id);
            expect(updatedResourceDocument).toMatchObject({
                ...expectedUpdatedResource,
            });

            // asserting updated resource role groups
            const newResourceRoleGroups = await mockResourceRoleGroupModel.find({
                resource_id: createdResource.id,
            });
            expect(newResourceRoleGroups.length).toBe(1);
            expect(newResourceRoleGroups[0]).toMatchObject({
                role_group_type: REGIONAL_MANAGER_ROLE_TYPE,
            });

            // asserting new attachment
            const attachmentDocument = (
                await mockAttachmentModel.find({
                    _id: updatedResourceDocument.attachment_id,
                })
            )[0];
            expect(attachmentDocument).toBeDefined();
            expect(attachmentDocument.name).toBe(mockFile.originalname);
        });
    });

    describe('Delete Resource', () => {
        beforeEach(async () => {
            // clean any prior data
            await mockResourceModel.deleteMany();
            await mockResourceRoleGroupModel.deleteMany();
        });
        it("fails to delete resource that user doesn't have access to", async () => {
            // arrange
            const SAMPLE_NON_ADMIN_USER_ROLE_TYPE = '_RELATIONSHIP_MANAGER';
            const ADMIN_USRE_ROLE_TYPE = '_ACCOUNT_ADMIN';
            const userSession = getMockUserSession([SAMPLE_NON_ADMIN_USER_ROLE_TYPE]);
            const createdResource = await mockResourceModel.create({
                name: 'Test Resource',
                status: ResourceStatus.ACTIVE,
                category: ResourceCategory.AMC,
                sub_category: ResourceSubCategory.SID,
                type: ResourceType.LINK,
                link: 'https://incredmoney.com',
                user_id: userSession.user_id,
                account_id: userSession.account_id,
            });
            await mockResourceRoleGroupModel.create({
                role_group_type: ADMIN_USRE_ROLE_TYPE,
                resource_id: createdResource.id,
                account_id: userSession.account_id,
            });

            // act
            const deleteResourceResponse = await service.deleteResource(
                userSession,
                createdResource.id,
            );

            // assert
            expect(deleteResourceResponse.success).toBe(false);
            expect(deleteResourceResponse.message).toMatch('Unauthorized');
            expect((await mockResourceModel.find({})).length).toBe(1);
            expect((await mockResourceRoleGroupModel.find({})).length).toBe(1);
        });
        it('successfully deletes resource', async () => {
            // arrange
            const ADMIN_USRE_ROLE_TYPE = '_ACCOUNT_ADMIN';
            const userSession = getMockUserSession([ADMIN_USRE_ROLE_TYPE]);
            const adminUser = await mockUserModel.create({
                email: 'sample@sample.com',
            });
            userSession.user_id = adminUser.id;
            const createdResource = await mockResourceModel.create({
                name: 'Test Resource',
                status: ResourceStatus.ACTIVE,
                category: ResourceCategory.PMS,
                sub_category: ResourceSubCategory.PMS_FACTSHEET,
                type: ResourceType.LINK,
                link: 'https://incredmoney.com',
                user_id: userSession.user_id,
                account_id: userSession.account_id,
            });
            await mockResourceRoleGroupModel.create({
                role_group_type: ADMIN_USRE_ROLE_TYPE,
                resource_id: createdResource.id,
                account_id: userSession.account_id,
            });

            // act
            const deleteResourceResponse = await service.deleteResource(
                userSession,
                createdResource.id,
            );

            // assert
            expect(deleteResourceResponse.success).toBe(true);
            expect(deleteResourceResponse.message).toMatch('Resource deleted successfully');
            expect((await mockResourceModel.find({})).length).toBe(0);
            expect((await mockResourceRoleGroupModel.find({})).length).toBe(0);
        });
    });
});

const getMockExpressMulterFile = (): Express.Multer.File => {
    return {
        fieldname: 'file',
        originalname: 'test_file.txt',
        encoding: 'utf-8',
        mimetype: 'text/plain',
        size: 123,
        stream: new Readable(),
        destination: 'dummy',
        filename: 'file',
        path: 'file',
        buffer: Buffer.from('dummy', 'utf-8'),
    };
};
