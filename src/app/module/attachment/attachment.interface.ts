export interface IAttachmentPayload {
  type: string; // VIDEO, PDF, DOCUMENT
  url: string;
  title?: string;
  ideaId: string;
}
