import { IdeaStatus } from "../../../generated/prisma/enums";

export interface IIdeaReviewPayload {
  ideaId: string;
  status: IdeaStatus;
  feedback: string;
}
