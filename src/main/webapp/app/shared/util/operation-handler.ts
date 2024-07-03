export enum OperationStatus {
  IN_PROGRESS,
  SUCCESSFUL,
  ERROR,
}

export const handleOperation = <R, Args extends any[]>(
  ctx: any,
  param: (...args: Args) => Generator<any, R, any> | AsyncGenerator<any, R, any>,
  operationHandler: (state: OperationStatus, result?, error?) => void
) =>
  function* (...args: Args) {
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
