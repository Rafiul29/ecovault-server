import { envVars } from "../../config/env";

export class EmbeddingService {
    private apiKey: string;
    private apiUrl: string = "https://openrouter.ai/api/v1";
    private embeddingModel: string;

    constructor() {
        // Remove the hardcoded "sk-or-v1-..." string entirely
        this.apiKey = envVars.RAG.OPENROUTER_API_KEY;
        this.embeddingModel = envVars.RAG.OPENROUTER_EMBEDDING_MODEL || "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

        if (!this.apiKey) {
            throw new Error("Missing OpenRouter API Key in environment variables");
        }

        if (!this.embeddingModel) {
            throw new Error("Missing OpenRouter embedding model configuration");
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