import { HttpException } from './HttpException';

export class ForbiddenException extends HttpException {
  constructor() {
    super(403, 'Forbidden');
  }
}
