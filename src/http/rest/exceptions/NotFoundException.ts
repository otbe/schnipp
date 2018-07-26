import { HttpException } from './HttpException';

export class NotFoundException extends HttpException {
  constructor() {
    super(404, 'Not Found');
  }
}
