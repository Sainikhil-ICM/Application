type GetTransactionsDtoProps = {
    page: number;
    per_page: number;
    foreign_id: string;
    email: string;
};

export class GetTransactionsDto {
    page: number;
    limit: number;
    userId: string;
    email: string;
    date: string;

    constructor(params: GetTransactionsDtoProps) {
        this.page = params.page;
        this.limit = params.per_page;
        this.userId = params.foreign_id;
        this.email = params.email;
        this.date = '1';
    }
}
