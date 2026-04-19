import {SearchResults, SearchResponse} from "./types/apiTypes";

const BASE_URL = process.env.NEXT_PUBLIC_BACK_END_BASE_URL;

export const api = {
    sync: async (): Promise<{status:string, details:string}> =>{
        const response = await fetch(`${BASE_URL}sync`, {
            method: "POST",
        });
        if (!response.ok)throw new Error('Failed to sync data');
        return await response.json();
    } ,

    search: async (query: string, limit: number=3): Promise<SearchResponse> =>{
        const response = await fetch(`${BASE_URL}search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({query, limit}),
        });

        if(!response.ok){
            const error = await response.json();
            throw new Error(error.detail || "Search failed");
        }
        return await response.json();
    },
};