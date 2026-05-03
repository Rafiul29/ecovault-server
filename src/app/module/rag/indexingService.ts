import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { EmbeddingService } from "./embeddingService";
import { extractText, getDocumentProxy } from "unpdf";

const toVectorLiteral = (vector: number[]) => `[${vector.join(",")}]`;

export class IndexingService {
    private embeddingService: EmbeddingService;

    constructor() {
        this.embeddingService = new EmbeddingService();
    }

    // Helper to fetch and extract text from a remote PDF/URL
    private async extractTextFromUrl(url: string, type: string): Promise<string> {
        try {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();

            if (type === "PDF") {
                const pdf = await getDocumentProxy(new Uint8Array(buffer));
                const { text } = await extractText(pdf, { mergePages: true });
                return text;
            }

            // For simple documents/text files
            return Buffer.from(buffer).toString('utf-8');
        } catch (error) {
            console.error(`Failed to extract text from ${url}:`, error);
            return "";
        }
    }

    async indexDocument(
        chunkKey: string,
        sourceType: string,
        sourceId: string,
        content: string,
        sourceLabel?: string,
        metadata?: Record<string, unknown>,
    ) {
        try {
            const embedding = await this.embeddingService.generateEmbedding(content);
            const vectorLiteral = toVectorLiteral(embedding);

            await prisma.$executeRaw(Prisma.sql`
                INSERT INTO "document_embeddings"
                (
                  "id", "chunkKey", "sourceType", "sourceId", "sourceLabel", 
                  "content", "metadata", "embedding", "updatedAt"
                )
                VALUES
                (
                  ${Prisma.raw("gen_random_uuid()")},
                  ${chunkKey},
                  ${sourceType},
                  ${sourceId},
                  ${sourceLabel || null},
                  ${content},
                  ${JSON.stringify(metadata || {})}::jsonb,
                  CAST(${vectorLiteral} AS vector),
                  NOW()
                )
                ON CONFLICT ("chunkKey")
                DO UPDATE SET
                  "sourceLabel" = EXCLUDED."sourceLabel",
                  "content" = EXCLUDED."content",
                  "metadata" = EXCLUDED."metadata",
                  "embedding" = EXCLUDED."embedding",
                  "isDeleted" = false,
                  "updatedAt" = NOW()
            `);
        } catch (error) {
            console.error("Indexing Error:", error);
            throw error;
        }
    }

    async indexIdeasData() {
        try {
            console.log("Fetching sustainability ideas with engagement counts...");

            const ideas = await prisma.idea.findMany({
                where: {
                    isDeleted: false,
                    status: 'APPROVED'
                },
                include: {
                    categories: { include: { category: true } },
                    tags: { include: { tag: true } },
                    author: { select: { name: true } },
                    // Integrating the relation counts
                    _count: {
                        select: {
                            comments: true,
                            votes: true,
                            purchases: true,
                            watchlists: true,
                        }
                    }
                }
            });

            let indexedCount = 0;

            for (const idea of ideas) {
                const categoriesList = idea.categories.map((ic) => ic.category.name).join(", ");
                const tagsList = idea.tags.map((it) => it.tag.name).join(", ");

                // Semantic content: Adding engagement context helps the LLM
                // determine popularity during natural language queries.
                const content = `
                    Title: ${idea.title}
                    Categories: ${categoriesList || "General"}
                    Engagement: ${idea._count.votes} votes, ${idea._count.purchases} supporters, ${idea._count.comments} comments.
                    
                    Problem: 
                    ${idea.problemStatement}
                    
                    Proposed Solution:
                    ${idea.proposedSolution}
                    
                    Description:
                    ${idea.description}
                `.trim();

                const metadata = {
                    ideaId: idea.id,
                    slug: idea.slug,
                    authorName: idea.author?.name,
                    isPaid: idea.isPaid,
                    price: idea.price,
                    trendingScore: idea.trendingScore,
                    // Storing counts in metadata for programmatic filtering/ranking
                    metrics: {
                        votes: idea._count.votes || 0,
                        purchases: idea._count.purchases || 0,
                        watchlists: idea._count.watchlists || 0,
                        comments: idea._count.comments || 0
                    }
                };

                const chunkKey = `idea-${idea.id}`;

                await this.indexDocument(
                    chunkKey,
                    "IDEA",
                    idea.id,
                    content,
                    idea.title,
                    metadata,
                );

                indexedCount++;
            }

            console.log(`Successfully Indexed ${indexedCount} ideas with metrics.`);

            return {
                success: true,
                indexedCount,
            };
        } catch (error) {
            console.error("Batch Indexing Error:", error);
            throw error;
        }
    }

    async indexAttachmentsData() {
        try {
            console.log("Fetching sustainability attachments for deep-scan indexing...");

            // Fetch attachments and include their parent Idea data for context
            const attachments = await prisma.attachment.findMany({
                where: {
                    type: { in: ["PDF", "DOCUMENT"] } // Skip VIDEO for text indexing
                },
                include: {
                    idea: {
                        include: {
                            _count: {
                                select: {
                                    votes: true,
                                    purchases: true,
                                    comments: true
                                }
                            }
                        }
                    }
                }
            });

            let indexedCount = 0;

            for (const attachment of attachments) {
                const idea = attachment.idea;

                // 1. Scan the URL for text data
                console.log(`Scanning content for: ${attachment.title || 'Untitled Attachment'}`);
                const extractedText = await this.extractTextFromUrl(attachment.url, attachment.type);

                if (!extractedText || extractedText.length < 10) continue;

                // 2. Combine idea context with attachment content
                // This allows the AI to know WHICH idea this PDF belongs to
                const content = `
                    Source: Attachment for "${idea.title}"
                    Attachment Title: ${attachment.title || "Technical Document"}
                    Document Content:
                    ${extractedText.substring(0, 5000)} // Limit characters for token efficiency
                `.trim();

                const metadata = {
                    attachmentId: attachment.id,
                    ideaId: idea.id,
                    type: attachment.type,
                    url: attachment.url,
                    parentIdeaTitle: idea.title,
                    metrics: {
                        votes: idea._count.votes,
                        purchases: idea._count.purchases
                    }
                };

                const chunkKey = `attachment-${attachment.id}`;

                // 3. Index as a separate document linked to the idea
                await this.indexDocument(
                    chunkKey,
                    "ATTACHMENT",
                    attachment.id,
                    content,
                    attachment.title || idea.title,
                    metadata
                );

                indexedCount++;
            }

            console.log(`Successfully scanned and indexed ${indexedCount} attachments.`);

            return {
                success: true,
                indexedCount,
            };
        } catch (error) {
            console.error("Batch Attachment Indexing Error:", error);
            throw error;
        }
    }



}