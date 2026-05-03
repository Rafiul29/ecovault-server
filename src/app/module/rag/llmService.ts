import { envVars } from "../../config/env";

export class LLMService {

    private apiKey: string;
    private apiUrl: string = "https://openrouter.ai/api/v1";
    private model: string;

    constructor() {
        this.apiKey = envVars.RAG.OPENROUTER_API_KEY || "";
        this.model =
            envVars.RAG.OPENROUTER_LLM_MODEL ||
            "nvidia/nemotron-3-super-120b-a12b:free";

        if (!this.apiKey) {
            throw new Error("OpenRouter api key is missing...");
        }
    }

    async generateResponse(
        prompt: string,
        context: string[] = [],
        asJson: boolean = false,
    ) {
        try {
            // Combine context with prompt for RAG
            // Updated Prompt to reflect Sustainability/EcoVault context
            let fullPrompt =
                context.length > 0
                    ? `Context from EcoVault Database:\n${context.join("\n\n")}\n\nUser Question: ${prompt}\n\nInstructions: Use the provided context to answer. If the context mentions a 'Paid' idea, emphasize its value but do not reveal restricted internal details unless specified.`
                    : prompt;

            if (asJson) {
                fullPrompt += `\n\nReturn ONLY a valid JSON object matching this structure: {
                    "ideas": [
                        {
                            "title": "Idea Title",
                            "summary": "Short 1-sentence summary",
                            "impactScore": "High/Medium/Low based on engagement",
                            "isPaid": true/false
                        }
                    ]
                }. Do not include markdown formatting.`;
            }

            const systemMessage = asJson
                ? "You are an AI expert for EcoVault, a sustainability community portal. You provide structured data about eco-friendly ideas. You MUST respond with ONLY valid JSON."
                : "You are the EcoVault Assistant. You help users discover community-driven sustainability ideas, environmental solutions, and green innovations. If the context doesn't contain the answer, politely suggest they browse our categories.";

            const bodyPayload: any = {
                model: this.model,
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: fullPrompt },
                ],
                temperature: 0.1,
                max_tokens: 1500,
            };

            if (
                asJson &&
                (this.model.includes("gpt") || this.model.includes("openai"))
            ) {
                bodyPayload.response_format = { type: "json_object" };
            }

            const response = await fetch(`${this.apiUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://healthcare-management.local",
                    "X-Title": "Healthcare Management System",
                },
                body: JSON.stringify(bodyPayload),
            });

            if (!response.ok) {
                const errorData = (await response.json()) as any;
                console.log(errorData)
                throw new Error(
                    `OpenRouter API error: ${response.status} - ${errorData?.error?.message} || "unknown error"`,
                );
            }

            const data = (await response.json()) as any;

            return data?.choices?.[0]?.message?.content;
        } catch (error) {
            console.error("Error generating LLM response:", error);
            throw error;
        }
    }
}