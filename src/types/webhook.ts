export interface WebhookPayloadCVU {
  id: number;
  cvu: string;
}

export interface WebhookPayloadOrigin {
  name: string;
  taxId: string;
  account: string;
}

export interface WebhookPayload {
  id: number;
  cvu: WebhookPayloadCVU;
  type: string;
  amount: number;
  origin: WebhookPayloadOrigin;
  status: string;
  coelsa_id: string;
}

export interface WebhookLog {
  id: number;
  created_at: string;
  payload: WebhookPayload;
}
