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
      const temp = param.apply(ctx, args);
      let result: R;
      if (temp instanceof Promise) {
        result = yield* await temp;
      } else {
        result = yield* temp;
      }
      operationHandler(OperationStatus.SUCCESSFUL, result);
      return result;
    } catch (e) {
      operationHandler(OperationStatus.ERROR, null, e);
      return yield Promise.reject(e);
    }
  };
