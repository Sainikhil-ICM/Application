import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class ProductPriceResDto {
    @Expose({ name: 'user_amount' })
    // @Transform(({ value }) => Math.imul(value, 100))
    // @Transform(({ value }) => value * 100)
    userAmount: number;

    @Expose({ name: 'price' })
    Price: number;

    @Expose({ name: 'maturity_amount' })
    totalAmountAtMaturity: number;

    constructor(partial: Partial<ProductPriceResDto>) {
        Object.assign(this, partial);
    }
}
