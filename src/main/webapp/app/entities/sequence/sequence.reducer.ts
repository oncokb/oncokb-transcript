import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { ISequence, defaultValue } from 'app/shared/model/sequence.model';

export const ACTION_TYPES = {
  FETCH_SEQUENCE_LIST: 'sequence/FETCH_SEQUENCE_LIST',
  FETCH_SEQUENCE: 'sequence/FETCH_SEQUENCE',
  CREATE_SEQUENCE: 'sequence/CREATE_SEQUENCE',
  UPDATE_SEQUENCE: 'sequence/UPDATE_SEQUENCE',
  PARTIAL_UPDATE_SEQUENCE: 'sequence/PARTIAL_UPDATE_SEQUENCE',
  DELETE_SEQUENCE: 'sequence/DELETE_SEQUENCE',
  SET_BLOB: 'sequence/SET_BLOB',
  RESET: 'sequence/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<ISequence>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

export type SequenceState = Readonly<typeof initialState>;

// Reducer

export default (state: SequenceState = initialState, action): SequenceState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_SEQUENCE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_SEQUENCE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_SEQUENCE):
    case REQUEST(ACTION_TYPES.UPDATE_SEQUENCE):
    case REQUEST(ACTION_TYPES.DELETE_SEQUENCE):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_SEQUENCE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_SEQUENCE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_SEQUENCE):
    case FAILURE(ACTION_TYPES.CREATE_SEQUENCE):
    case FAILURE(ACTION_TYPES.UPDATE_SEQUENCE):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_SEQUENCE):
    case FAILURE(ACTION_TYPES.DELETE_SEQUENCE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_SEQUENCE_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.FETCH_SEQUENCE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_SEQUENCE):
    case SUCCESS(ACTION_TYPES.UPDATE_SEQUENCE):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_SEQUENCE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_SEQUENCE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {},
      };
    case ACTION_TYPES.SET_BLOB: {
      const { name, data, contentType } = action.payload;
      return {
        ...state,
        entity: {
          ...state.entity,
          [name]: data,
          [name + 'ContentType']: contentType,
        },
      };
    }
    case ACTION_TYPES.RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

const apiUrl = 'api/sequences';

// Actions

export const getEntities: ICrudGetAllAction<ISequence> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_SEQUENCE_LIST,
  payload: axios.get<ISequence>(`${apiUrl}?cacheBuster=${new Date().getTime()}`),
});

export const getEntity: ICrudGetAction<ISequence> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_SEQUENCE,
    payload: axios.get<ISequence>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<ISequence> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_SEQUENCE,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<ISequence> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_SEQUENCE,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<ISequence> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_SEQUENCE,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<ISequence> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_SEQUENCE,
    payload: axios.delete(requestUrl),
  });
  dispatch(getEntities());
  return result;
};

export const setBlob = (name, data, contentType?) => ({
  type: ACTION_TYPES.SET_BLOB,
  payload: {
    name,
    data,
    contentType,
  },
});

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
