export interface ICreateTagPayload {
    name: string;
    slug?: string;
}

export interface IUpdateTagPayload {
    name?: string;
    slug?: string;
}
