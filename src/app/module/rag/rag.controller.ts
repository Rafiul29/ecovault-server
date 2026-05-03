import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import httpStatus from "http-status";
import { Request, Response } from "express";
import { RAGService } from "./rag.service";
import { redisService } from "../../lib/redis";

const ragService = new RAGService();

const getStats = catchAsync(async (req: Request, res: Response) => {

    const result = await ragService.getStats();

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: 'connected rag api',
        data: result,
    });
});


const ingestIdeasData = catchAsync(async (req: Request, res: Response) => {
    const result = await ragService.ingestIdeasData();
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: 'ingest ideas data successfully',
        data: result,
    });
});

const ingestAttachmentsData = catchAsync(async (req: Request, res: Response) => {
    const result = await ragService.ingestAttachmentsData();
    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: 'ingest attachments data successfully',
        data: result,
    });
});

const qyeryRag = catchAsync(async (req: Request, res: Response) => {
    const { query, limit, sourceType } = req.body;
    if (!query) {
        throw sendResponse(res, {
            httpStatusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'query is required',
        });
    }


    // Generate cache key from query parameters
    const cacheKey = `rag:query:${query}:${limit ?? 5}:${sourceType || 'all'}`;

    try {
        // Try to get from cache first
        const cachedResult = await redisService.get(cacheKey);

        if (cachedResult) {
            // Cache hit - parse and return cached data
            const parsedData = JSON.parse(cachedResult);

            sendResponse(res, {
                success: true,
                httpStatusCode: httpStatus.OK,
                message: "Answer retrieved from cache",
                data: parsedData,
            });
            return;
        }
    } catch (cacheError) {
        // Log cache error but continue with normal processing
        console.warn('Cache read error, proceeding with normal processing:', cacheError);
    }


    const result = await ragService.generateAnswer(query, limit, sourceType);

    // Store result in cache with 30-minute TTL (1800 seconds)
    try {
        await redisService.set(cacheKey, result, 1800);
    } catch (cacheError) {
        // Log cache error but don't fail the request
        console.warn('Cache write error:', cacheError);
    }


    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: 'query doctors data successfully',
        data: result,
    });
});


export const RagController = {
    getStats,
    ingestIdeasData,
    ingestAttachmentsData,
    qyeryRag,
}