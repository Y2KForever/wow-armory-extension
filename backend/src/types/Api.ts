export type ApiResultResponse = {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
};

export type PostFetchCharacters = {
  namespaces: string[];
  region: string;
}