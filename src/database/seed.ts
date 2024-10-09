import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeders/seeder.module';
import { SeederService } from './seeders/seeder.service';
import * as mongoose from 'mongoose';
import * as bluebird from 'bluebird';

// async function bootstrap() {
//     NestFactory.createApplicationContext(SeederModule)
//         .then((appContext) => {
//             // Mongoose with bluebird
//             (<any>mongoose).Promise = bluebird;
//             mongoose.set('debug', true);

//             const seeder = appContext.get(SeederService);
//             seeder
//                 .seed()
//                 .then(() => {
//                     console.debug('Seeding complete!');
//                 })
//                 .catch((error) => {
//                     console.error('Seeding failed!');
//                     throw error;
//                 })
//                 .finally(() => appContext.close());
//         })
//         .catch((error) => {
//             throw error;
//         });
// }
// bootstrap();

(async () => {
    const appContext = await NestFactory.createApplicationContext(SeederModule);
    const seederService = appContext.get(SeederService);

    // Mongoose with bluebird
    (<any>mongoose).Promise = bluebird;
    mongoose.set('debug', true);

    seederService
        .seedCustomers()
        .then(() => {
            console.log('🚀 ~ file: seed.ts:13 ~ .then ~ Seeding complete!');
        })
        .catch((error) => {
            console.log('🚀 ~ file: seed.ts:16 ~ .then ~ Seeding failed!:');
            throw error;
        })
        .finally(() => appContext.close());
})();
