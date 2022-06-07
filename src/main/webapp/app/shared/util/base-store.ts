import { flow, observable, makeObservable } from 'mobx';
import { IRootStore } from 'app/stores';
import { handleOperation, OperationStatus } from 'app/shared/util/operation-handler';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';

export class BaseStore {
  public loading = false;
  public errorMessage = null;
  public updating = false;
  public updateSuccess = false;

  constructor(protected rootStore: IRootStore) {
    makeObservable(this, {
      loading: observable,
      errorMessage: observable,
      updating: observable,
      updateSuccess: observable,
    });
  }

  protected resetBase() {
    this.loading = false;
    this.errorMessage = null;
    this.updating = false;
    this.updateSuccess = false;
  }

  updateHandler = <R, Args extends any[]>(
    param: (...args: Args) => Generator<any, R, any> | AsyncGenerator<any, R, any>,
    successMessage?,
    errorMessage?
  ) => flow(handleOperation(this, param, this.updateOperationHandler(successMessage, errorMessage)));

  updateOperationHandler = (successMessage?, errorMessage?) => {
    return (state: OperationStatus, result?, error?) => {
      switch (state) {
        case OperationStatus.IN_PROGRESS: {
          this.updateSuccess = false;
          this.rootStore.loadingStore.showLoading();
          this.updating = true;
          this.errorMessage = null;
          break;
        }
        case OperationStatus.SUCCESSFUL: {
          this.updateSuccess = true;
          this.updating = false;
          this.rootStore.loadingStore.hideLoading();
          notifySuccess(successMessage || 'Successfully updated entity');
          break;
        }
        case OperationStatus.ERROR:
        default: {
          this.updateSuccess = false;
          const translatedMessage = errorMessage;
          this.errorMessage = translatedMessage || (error && error.message);
          this.updating = false;
          this.rootStore.loadingStore.hideLoading();
          notifyError(error);
          break;
        }
      }
    };
  };

  readHandler = <R, Args extends any[]>(
    param: (...args: Args) => Generator<any, R, any> | AsyncGenerator<any, R, any>,
    successMessage?: string,
    errorMessage?: string
  ) => flow(handleOperation(this, param, this.readOperationHandler(successMessage, errorMessage)));

  readOperationHandler = (successMessage?: string, errorMessage?: string) => {
    return (state: OperationStatus, result?, error?) => {
      switch (state) {
        case OperationStatus.IN_PROGRESS: {
          this.rootStore.loadingStore.showLoading();
          this.loading = true;
          this.errorMessage = null;
          this.updateSuccess = false;
          break;
        }
        case OperationStatus.SUCCESSFUL: {
          this.loading = false;
          this.rootStore.loadingStore.hideLoading();
          break;
        }
        case OperationStatus.ERROR:
        default: {
          const translatedMessage = errorMessage;
          this.errorMessage = translatedMessage || (error && error.message);
          this.loading = false;
          this.rootStore.loadingStore.hideLoading();
          break;
        }
      }
    };
  };
}

export default BaseStore;
