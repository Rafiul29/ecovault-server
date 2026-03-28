import { ReactionType } from "../../../generated/prisma/enums";

export interface ICommentPayload {
  content: string;
  ideaId: string;
  parentId?: string;
}

export interface ICommentReactionPayload {
  commentId: string;
  type: ReactionType;
}
