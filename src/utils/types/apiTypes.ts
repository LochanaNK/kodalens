export interface SearchResults {
    id:string,
    content:string,
    metadata:{
        source:string;
        date:string;
        hash:string;
    };
    distance:number;
}

export interface SearchResponse {
    results: SearchResults[];
}
