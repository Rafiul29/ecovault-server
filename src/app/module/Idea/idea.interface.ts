export interface ICreateIdeaPayload {
    title: string;
    slug?: string;
    description: string;
    problemStatement: string;
    proposedSolution: string;
    images?: string[];
    categories?: string[];
    tags?: string[];
    status?: string;
    isPaid?: boolean;
    price?: number;
    isFeatured?: boolean;
}

export interface IUpdateIdeaPayload {
    title?: string;
    slug?: string;
    description?: string;
    problemStatement?: string;
    proposedSolution?: string;
    images?: string[];
    categories?: string[];
    tags?: string[];
    status?: string;
    isPaid?: boolean;
    price?: number;
    isFeatured?: boolean;
}
