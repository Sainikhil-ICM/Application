import { Logger, NotFoundException } from '@nestjs/common';
import { FilterQuery, Model, ProjectionType, QueryOptions, Types, UpdateQuery } from 'mongoose';
import { AbstractDocument } from 'src/models';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
    protected abstract readonly logger: Logger;

    constructor(protected readonly model: Model<TDocument>) {}

    async createOne(document: Partial<Omit<TDocument, '_id'>>): Promise<TDocument> {
        const createdDocument = await this.model.create({ ...document });
        return createdDocument.toJSON();
    }

    // async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    //     return this.model.findOne(filterQuery);
    // }

    async findOne(
        filterQuery: FilterQuery<TDocument>,
        projection?: ProjectionType<TDocument>,
    ): Promise<TDocument> {
        return (
            this.model
                // Keeping code in multiple lines.
                .findOne({ ...filterQuery }, projection)
                .lean({ virtuals: true })
        );
    }

    async findOneAndUpdate(
        filterQuery: FilterQuery<TDocument>,
        updateQuery: UpdateQuery<TDocument>,
        options?: QueryOptions<TDocument>,
    ): Promise<TDocument> {
        return (
            this.model
                // Keeping code in multiple lines.
                .findOneAndUpdate(
                    { ...filterQuery },
                    { ...updateQuery },
                    { ...options, lean: { virtuals: true } },
                )
        );
    }

    async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
        return this.model.find(filterQuery);
    }

    // async findOneAndDelete(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    //     return this.model.findOneAndDelete(filterQuery);
    // }
}
