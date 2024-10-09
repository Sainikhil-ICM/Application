export enum OrderStatus {
    PAYMENT_LINK_SENT = 'PAYMENT_LINK_SENT', // 'Payment Link Sent',
    PAYMENT_LINK_OPENED = 'PAYMENT_LINK_OPENED', // 'Payment Link Opened',
    PAYMENT_COMPLETED = 'PAYMENT_COMPLETED', // 'Payment Completed',
    PAYMENT_FAILED = 'PAYMENT_FAILED', // 'Payment Failed',
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS', // 'Payment Success',
    PAYMENT_RECEIVED = 'PAYMENT_RECEIVED', // 'Payment Received',

    REFUND_PROCESSED = 'REFUND_PROCESSED', // 'Refund Processed',

    DIGIO_DOC_SENT = 'DIGIO_DOC_SENT', // 'Digio Doc Sent',
    DIGIO_DOC_OPENED = 'DIGIO_DOC_OPENED', // 'Digio Doc Opened',
    DIGIO_SIGN_INITIATED = 'DIGIO_SIGN_INITIATED', // 'Digio Doc Initiated',
    DIGIO_SIGN_SUCCESS = 'DIGIO_SIGN_SUCCESS', // 'Digio Doc Signed',
    DIGIO_SIGN_FAILED = 'DIGIO_SIGN_FAILED', // 'Digio Doc Failed',

    ORDER_INITIATED = 'ORDER_INITIATED', // 'Order Initiated',
    ORDER_PROCESSED = 'ORDER_PROCESSED', // 'Order Processed',
    ORDER_ACCEPTED = 'ORDER_ACCEPTED', // 'Order Accepted',
    ORDER_REJECTED = 'ORDER_REJECTED', // 'Order Rejected',
    ORDER_CREATED = 'ORDER_CREATED', // 'Order Created',
    ORDER_PREBOOKED = 'ORDER_PREBOOKED', // 'Order Prebooked',
    ORDER_PENDING = 'ORDER_PENDING', // 'Order Pending',
    ORDER_FAILED = 'ORDER_FAILED', // 'Order Failed',
    ORDER_CANCELLED = 'ORDER_CANCELLED', // 'Order Cancelled',
    ORDER_SUCCESS = 'ORDER_SUCCESS', // 'Order Success',
    ORDER_LIMIT_REACHED = 'ORDER_LIMIT_REACHED', // 'Order Limit Reached',
}

export enum SyncOrderStatusMap {
    'Payment Link Sent' = 'PAYMENT_LINK_SENT', // 'Payment Link Sent',
    'Payment Link Opened' = 'PAYMENT_LINK_OPENED', // 'Payment Link Opened',
    'Payment Completed' = 'PAYMENT_COMPLETED', // 'Payment Completed',
    'Payment Failed' = 'PAYMENT_FAILED', // 'Payment Failed',
    'Payment Success' = 'PAYMENT_SUCCESS', // 'Payment Success',
    'Payment Received' = 'PAYMENT_RECEIVED', // 'Payment Received',

    'Refund Processed' = 'REFUND_PROCESSED', // 'Refund Processed',

    'Digio Doc Sent' = 'DIGIO_DOC_SENT', // 'Digio Doc Sent',
    'Digio Doc Opened' = 'DIGIO_DOC_OPENED', // 'Digio Doc Opened',
    'Digio Doc Initiated' = 'DIGIO_SIGN_INITIATED', // 'Digio Doc Initiated',
    'Digio Doc Signed' = 'DIGIO_SIGN_SUCCESS', // DIGIO_SIGN_SUCCESS = 'Digio Doc Signed',
    'Digio Doc Failed' = 'DIGIO_SIGN_FAILED', // DIGIO_SIGN_FAILED = 'Digio Doc Failed',
    'Order Initiated' = 'ORDER_INITIATED', // ORDER_INITIATED = 'Order Initiated',
    'Order Processed' = 'ORDER_PROCESSED', // ORDER_PROCESSED = 'Order Processed',
    'Order Accepted' = 'ORDER_ACCEPTED', // ORDER_ACCEPTED = 'Order Accepted',
    'Order Rejected' = 'ORDER_REJECTED', // ORDER_REJECTED = 'Order Rejected',
    'Order Created' = 'ORDER_CREATED', // ORDER_CREATED = 'Order Created',
    'Order Prebooked' = 'ORDER_PREBOOKED', // ORDER_PREBOOKED = 'Order Prebooked',
    'Order Pending' = 'ORDER_PENDING', // ORDER_PENDING = 'Order Pending',
    'Order Failed' = 'ORDER_FAILED', // ORDER_FAILED = 'Order Failed',
    'Order Cancelled' = 'ORDER_CANCELLED', // ORDER_CANCELLED = 'Order Cancelled',
    'Order Success' = 'ORDER_SUCCESS', // ORDER_SUCCESS = 'Order Success',
    'Order Limit Reached' = 'ORDER_LIMIT_REACHED',
    'created' = 'ORDER_CREATED',
    'success' = 'ORDER_PROCESSED',
    'failed' = 'ORDER_FAILED',
    'approved' = 'PAYMENT_SUCCESS',
    'pending' = 'ORDER_PENDING',
}

export enum ScheduleType {
    RECURRING = 'RECURRING',
    ONE_TIME = 'ONE_TIME',
}
export enum CartType {
    RECURRING = 'RECURRING',
    ONE_TIME = 'ONE_TIME',
    REDEMPTION = 'REDEMPTION',
    SWITCH = 'SWITCH',
    STP = 'STP',
    SWP = 'SWP',
}

export enum MfSubType {
    SIP = 'SIP',
    LUMPSUM = 'LUMPSUM',
    REDEMPTION = 'REDEMPTION',
    SWITCH_IN = 'SWITCH_IN',
    SWITCH_OUT = 'SWITCH_OUT',
    STP_IN = 'STP_IN',
    STP_OUT = 'STP_OUT',
    SWP = 'SWP',
}

export enum PaymentType {
    PURCHASE = 'purchase',
    REDEEM = 'redeem',
    SWITCH = 'switch',
}
