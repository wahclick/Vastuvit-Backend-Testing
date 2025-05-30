export enum ChequeStatus {
    PRESENTED_TO_BANK = 'presented_to_bank',
    ACCOUNT_CREDITED = 'account_credited', 
    CHEQUE_BOUNCED = 'cheque_bounced',
    CHEQUE_CANCELLED = 'cheque_cancelled',
    NOT_APPLICABLE = 'not_applicable' // For non-cheque payments
  }
  