import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IInfo, defaultValue } from 'app/shared/model/info.model';

export const ACTION_TYPES = {
  FETCH_INFO_LIST: 'info/FETCH_INFO_LIST',
  FETCH_INFO: 'info/FETCH_INFO',
  CREATE_INFO: 'info/CREATE_INFO',
  UPDATE_INFO: 'info/UPDATE_INFO',
  PARTIAL_UPDATE_INFO: 'info/PARTIAL_UPDATE_INFO',
  DELETE_INFO: 'info/DELETE_INFO',
  RESET: 'info/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IInfo>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

export type InfoState = Readonly<typeof initialState>;

// Reducer

export default (state: InfoState = initialState, action): InfoState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_INFO_LIST):
    case REQUEST(ACTION_TYPES.FETCH_INFO):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_INFO):
    case REQUEST(ACTION_TYPES.UPDATE_INFO):
    case REQUEST(ACTION_TYPES.DELETE_INFO):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_INFO):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_INFO_LIST):
    case FAILURE(ACTION_TYPES.FETCH_INFO):
    case FAILURE(ACTION_TYPES.CREATE_INFO):
    case FAILURE(ACTION_TYPES.UPDATE_INFO):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_INFO):
    case FAILURE(ACTION_TYPES.DELETE_INFO):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_INFO_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.FETCH_INFO):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_INFO):
    case SUCCESS(ACTION_TYPES.UPDATE_INFO):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_INFO):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_INFO):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {},
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

const apiUrl = 'api/infos';

// Actions

export const getEntities: ICrudGetAllAction<IInfo> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_INFO_LIST,
  payload: axios.get<IInfo>(`${apiUrl}?cacheBuster=${new Date().getTime()}`),
});

export const getEntity: ICrudGetAction<IInfo> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_INFO,
    payload: axios.get<IInfo>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<IInfo> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_INFO,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IInfo> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_INFO,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<IInfo> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_INFO,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IInfo> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_INFO,
    payload: axios.delete(requestUrl),
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
