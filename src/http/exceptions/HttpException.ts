export class HttpException {
  constructor(
    public readonly statusCode: number,
    public readonly message?: string
  ) {}
}
