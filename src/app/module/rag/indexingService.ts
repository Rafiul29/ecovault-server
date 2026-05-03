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


    async indexPlatformData() {
        try {
            console.log("Indexing EcoVault platform FAQs and description...");

            // ─── Broad platform overview ────────────────────────────────────────
            const platformDescription = `
                    EcoVault Platform Overview

                    EcoVault is a sustainability-focused innovation platform where eco-conscious individuals, students,
                    professionals, and entrepreneurs can share, discover, fund, and collaborate on ideas that protect
                    our environment. The platform is built around community engagement and real-world impact.

                    Core capabilities:
                    - Idea submission: Anyone with a passion for sustainability can publish an idea with a title,
                    problem statement, proposed solution, and supporting attachments (PDFs, images, videos).
                    - Community engagement: Users can upvote ideas they believe in, leave comments, add ideas to
                    watchlists, and purchase/support funded projects.
                    - Funding pipeline: Ideas that gain traction and meet quality criteria become eligible for review
                    by EcoVault's panel of investors and expert mentors. Successful projects receive funding,
                    mentorship, and resources to reach real-world implementation.
                    - Idea lifecycle: Draft → Under Review → Approved → Featured / Funded.
                    - Monetisation: Core community access is free. Premium features and exclusive project details
                    may require a subscription or one-time payment.
                    - Intellectual property: Submitters choose how much detail to expose publicly. EcoVault encourages
                    sharing the "what" and "why" while keeping proprietary implementation details confidential until
                    appropriate protections or partnerships are in place.
                    - Editing: Innovators can edit and refine their ideas at any time after publishing.
                    - Categories & Tags: Ideas are organised by sustainability category and relevant tags to help
                    users discover related innovations.
                    - Trending: Ideas accumulate a trending score based on votes, purchases, watchlists, and comments.

                    EcoVault's mission is to accelerate the transition to a sustainable future by connecting innovators
                    with supporters, mentors, and capital.
            `.trim();

            await this.indexDocument(
                "platform-overview",
                "PLATFORM",
                "platform-overview",
                platformDescription,
                "EcoVault Platform Overview",
                { type: "overview" },
            );

            // ─── Dedicated knowledge chunks ─────────────────────────────────────
            const knowledgeChunks = [
                {
                    key: "what-is-ecovault",
                    label: "What is EcoVault?",
                    content: `
                        What is EcoVault?

                        EcoVault is an online community portal purpose-built for sustainability. It is a place where
                        community members can share sustainably oriented ideas — for example, reducing plastic
                        consumption, launching a solar power project, or developing water-recycling systems — in order
                        to help the environment.

                        At its core EcoVault is three things:
                        1. An idea-sharing hub where anyone can publish eco-friendly innovations with a title, problem
                           statement, proposed solution, description, images, and supporting documents (PDFs, videos).
                        2. A community engagement layer where members explore, upvote, comment on, and watchlist
                           the ideas they care about.
                        3. A funding pipeline where the best ideas are reviewed by admins, mentors, and investors
                           so they can receive real-world support.

                        The platform serves students, professionals, entrepreneurs, and everyday eco-enthusiasts who
                        want to turn sustainability concepts into tangible impact.
                    `.trim(),
                },
                {
                    key: "why-ecovault",
                    label: "Why EcoVault? – Mission and Purpose",
                    content: `
                        Why does EcoVault exist?

                        The world faces accelerating environmental challenges — climate change, biodiversity loss,
                        pollution, and resource depletion. Many people have innovative solutions but lack a platform
                        to share them, get feedback, and attract funding.

                        EcoVault was created to solve this gap. Its mission is to accelerate the transition to a
                        sustainable future by:
                        - Giving every eco-conscious individual a voice, regardless of background or credentials.
                        - Building a collaborative community where ideas are refined through discussion, upvotes,
                          and expert feedback.
                        - Connecting promising innovations with investors, mentors, and resources so they can move
                          from concept to real-world implementation.
                        - Ensuring transparency and quality through an admin-moderated review pipeline that surfaces
                          the best ideas for the entire community.

                        In short, EcoVault exists because great sustainability ideas deserve a home, an audience,
                        and a path to reality.
                    `.trim(),
                },
                {
                    key: "how-ecovault-works",
                    label: "How EcoVault Works – Platform Workflow",
                    content: `
                        How does EcoVault work?

                        EcoVault follows a structured workflow that takes an idea from a rough draft to a funded,
                        real-world project:

                        Step 1 — Create & Draft
                        A logged-in member creates an idea by filling in a title, problem statement, proposed
                        solution, detailed description, images, and optional attachments (PDFs, videos). The idea
                        starts in "Draft" mode, visible only to the author. Members can save drafts and come back
                        to refine them before publishing.

                        Step 2 — Submit for Review
                        When the member is ready, they submit the idea. Its status changes from "Draft" to
                        "Under Review" and enters the admin moderation queue.

                        Step 3 — Admin Review
                        Admins and Super Admins evaluate the submission for quality, relevance, and sustainability
                        impact. Three outcomes are possible:
                        • Approve — the idea becomes publicly visible to the entire community.
                        • Reject — the idea is returned to the member with written feedback explaining why it was
                          not approved, so they can revise and resubmit.

                        Step 4 — Community Engagement
                        Once approved, the idea is live. Community members can:
                        • Upvote / downvote to signal support.
                        • Comment to provide feedback and discuss improvements.
                        • Add to watchlist to track progress.
                        • Purchase or support funded ideas to contribute resources.

                        Step 5 — Trending & Discovery
                        Ideas accumulate a trending score based on votes, purchases, watchlists, and comments.
                        High-trending ideas are surfaced prominently so the community can discover the most
                        impactful innovations. Ideas are also organised by categories and tags.

                        Step 6 — Funding & Mentorship
                        Ideas that gain significant traction become eligible for review by EcoVault's panel of
                        investors and expert mentors. Successful projects receive funding, mentorship, and resources.

                        Editing rules:
                        • Members can edit or delete their ideas only while they are in Draft or Under Review status.
                        • Once an idea is Approved and published, the member can still update description, images,
                          and attachments, but cannot delete it.
                    `.trim(),
                },
                {
                    key: "idea-management-workflow",
                    label: "Idea Management – Roles and Rules",
                    content: `
                        Idea Management on EcoVault

                        Only logged-in members can create ideas. The idea lifecycle follows strict rules:

                        Creating an Idea:
                        Members fill in: Title, Problem Statement, Proposed Solution, Description, Images, and
                        optional attachments (PDFs, documents, videos). Each idea is assigned categories and tags
                        for discoverability.

                        Idea Statuses:
                        1. DRAFT — The idea is saved but not yet submitted. Only the author can see it. The author
                           can freely edit or delete it.
                        2. UNDER_REVIEW — The idea has been submitted for admin moderation. The author can still
                           edit it, but cannot delete it.
                        3. APPROVED — An admin has approved the idea. It is now publicly visible. The author can
                           update content but cannot delete it.
                        4. REJECTED — An admin has rejected the idea with feedback. The author can revise and
                           resubmit it.

                        Admin Actions:
                        • Admins and Super Admins can view all submitted ideas in the moderation queue.
                        • They can Approve an idea (status → APPROVED, becomes public).
                        • They can Reject an idea (status → REJECTED, returned with feedback).
                        • Admins ensure quality, relevance, and alignment with sustainability goals.

                        Paid Ideas:
                        Some ideas may be marked as "paid" with a price. Community members can purchase access
                        to the full details of paid ideas. The author sets the price.

                        Engagement Metrics:
                        Each idea tracks: total votes, total comments, total purchases, and total watchlists.
                        These metrics feed into a trending score that determines visibility on the platform.
                    `.trim(),
                },
            ];

            let indexedCount = 1; // start at 1 to count the overview above

            for (const chunk of knowledgeChunks) {
                await this.indexDocument(
                    chunk.key,
                    "PLATFORM",
                    chunk.key,
                    chunk.content,
                    chunk.label,
                    { type: "knowledge" },
                );
                indexedCount++;
            }

            console.log(`Successfully indexed ${indexedCount} platform documents (1 overview + ${knowledgeChunks.length} knowledge).`);

            return {
                success: true,
                indexedCount,
            };
        } catch (error) {
            console.error("Platform Indexing Error:", error);
            throw error;
        }
    }

}