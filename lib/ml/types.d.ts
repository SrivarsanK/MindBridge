// Type declarations for ML libraries

declare module 'natural' {
  export class WordTokenizer {
    tokenize(text: string): string[] | null;
  }
  export class TfIdf {
    addDocument(document: string): void;
    tfidfs(term: string, doc: number, callback: (i: number, measure: number) => void): void;
  }
}

declare module 'sentiment' {
  export default class Sentiment {
    analyze(text: string): {
      score: number;
      comparative: number;
      calculation: any[];
      tokens: string[];
      words: string[];
      positive: string[];
      negative: string[];
    };
  }
}

declare module 'compromise' {
  interface Document {
    topics(): { out(format: string): string[] };
    out(format: string): any;
  }
  
  function nlp(text: string): Document;
  export default nlp;
}

declare module 'stopword' {
  export function removeStopwords(words: string[], stopwords: string[]): string[];
  export const eng: string[];
}
