import React from 'react';
import { IUser } from '../model/user.model';
import { FaUserCircle } from 'react-icons/fa';
import { DEFAULT_NAV_ICON_SIZE } from 'app/config/constants/constants';

export interface IAvatar {
  user: IUser | undefined;
}

export const Avatar = ({ user }: IAvatar) => {
  if (!user?.imageUrl) {
    return <FaUserCircle size={DEFAULT_NAV_ICON_SIZE} />;
  }
  return (
    <div className="d-flex justify-content-center align-items-center">
      <img className="rounded-circle" src={user.imageUrl} width={DEFAULT_NAV_ICON_SIZE} height={DEFAULT_NAV_ICON_SIZE}></img>
    </div>
  );
};
