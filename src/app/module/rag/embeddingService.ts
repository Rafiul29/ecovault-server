import { envVars } from "../../config/env";

export class EmbeddingService {
    private apiKey: string;
    private apiUrl: string = "https://openrouter.ai/api/v1";
    private embeddingModel: string;

    constructor() {
        this.apiKey = envVars.RAG.OPENROUTER_API_KEY || "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"
        this.embeddingModel = envVars.RAG.OPENROUTER_EMBEDDING_MODEL || "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"

        if (!this.apiKey || !this.embeddingModel) {
            throw new Error("Missing OpenRouter configuration")
        }
    }
    async generateEmbedding(text: string) {
        try {
            const response = await fetch(`${this.apiUrl}/embeddings`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    input: text,
                    model: this.embeddingModel,
                    dimensions: 2048
                }),
            });

            if (!response.ok) {
                const errorData = (await response.json()) as any;
                console.log(errorData)
                throw new Error(
                    `OpenRouter API error: ${response.status} - ${errorData?.error?.message}`,
                );
            }

            const data = (await response.json()) as any;

            if (!data?.data || data?.data?.length == 0) {
                throw new Error("No embedding data returned");
            }

            return data?.data?.[0]?.embedding;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

}