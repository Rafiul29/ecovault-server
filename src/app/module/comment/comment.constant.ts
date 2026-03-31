export const commentSearchableFields = ["content"];

export const commentFilterableFields = [
    "authorId",
    "ideaId",
    "parentId",
    "isDeleted",
    "isFlagged",
];

export const commentIncludeConfig = {
    author: {
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
    },
    idea: {
        select: {
            id: true,
            title: true,
            slug: true,
        },
    },
    _count: {
        select: {
            reactions: true,
            replies: true,
        },
    },
};
