import { AxiosResponse } from 'axios';
import { CancellablePromise } from 'mobx/dist/api/flow';

export type IPayload<T> = Promise<AxiosResponse<T>> | CancellablePromise<unknown>;

export type ICrudGetAction<T> = (id: string | number) => IPayload<T>;

export interface IQueryParams {
  query?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ISearchParams extends IQueryParams {
  search?: string;
}
export type ICrudGetAllAction<T> = (params: IQueryParams) => IPayload<T[]>;
export type ICrudSearchAction<T> = (params: ISearchParams) => IPayload<T[]>;
export type ICrudDeleteAction<T> = (id?: string | number) => IPayload<T>;
export type ICrudPutAction<T> = (data?: T) => IPayload<T>;
