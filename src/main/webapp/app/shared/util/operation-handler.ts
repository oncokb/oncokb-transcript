export enum OperationStatus {
  IN_PROGRESS,
  SUCCESSFUL,
  ERROR,
}

export const handleOperation = <R, Args extends unknown[]>(
  ctx: any,
  param: (...args: Args) => Generator<unknown, R, unknown> | AsyncGenerator<unknown, R, unknown>,
  operationHandler: (state: OperationStatus, result?, error?) => void,
) =>
  async function* (...args: Args) {
    try {
      operationHandler(OperationStatus.IN_PROGRESS);
      const result: R = yield* param.apply(ctx, args);
      operationHandler(OperationStatus.SUCCESSFUL, result);
      return result;
    } catch (e) {
      operationHandler(OperationStatus.ERROR, null, e);
      return yield Promise.reject(e);
    }
  };
