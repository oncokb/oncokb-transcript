import DefaultBadge from 'app/shared/badge/DefaultBadge';
import InfoIcon from 'app/shared/icons/InfoIcon';
import { Alteration, StringMutationInfo } from 'app/shared/model/firebase/firebase.model';
import { getAlterationName, isFlagEqualToIFlag } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { buildAlterationName, parseAlterationName } from 'app/shared/util/utils';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import React from 'react';
import * as styles from './styles.module.scss';
import classNames from 'classnames';

export interface IMutationCollapsibleTitle extends StoreProps {
  name: string | undefined;
  mutationAlterations: Alteration[] | null | undefined;
  stringMutationInfo: StringMutationInfo | null;
}
const MutationCollapsibleTitle = ({ name, mutationAlterations, stringMutationInfo, flags }: IMutationCollapsibleTitle) => {
  const defaultName = 'No Name';
  let stringMutationBadges: JSX.Element | undefined;
  const shouldGroupBadges =
    (stringMutationInfo?.flags?.length || 0) > 1 || (stringMutationInfo?.flags?.length === 1 && stringMutationInfo.comment !== '');
  if (stringMutationInfo?.flags && flags) {
    let tooltipOverlay: JSX.Element | undefined = undefined;
    stringMutationBadges = (
      <div className={classNames(shouldGroupBadges ? styles.flagWrapper : undefined)}>
        {stringMutationInfo.flags.map(flag => {
          if (stringMutationInfo.comment) {
            tooltipOverlay = <span>{stringMutationInfo.comment}</span>;
          }
          const matchedFlagEntity = flags.find(flagEntity => isFlagEqualToIFlag(flag, flagEntity));
          return <DefaultBadge key={matchedFlagEntity?.flag || flag.flag} color={'primary'} text={matchedFlagEntity?.name || flag.flag} />;
        })}
        {tooltipOverlay ? <InfoIcon className="me-1" overlay={tooltipOverlay} /> : undefined}
      </div>
    );
  }
  if (mutationAlterations) {
    return (
      <>
        {mutationAlterations.map((alteration, index) => {
          return (
            <>
              <span>{getAlterationName(alteration, true)}</span>
              {alteration.comment && <InfoIcon className="ms-1" overlay={alteration.comment} />}
              {index < mutationAlterations.length - 1 && <span>, </span>}
            </>
          );
        })}
        {stringMutationBadges}
      </>
    );
  }
  if (name) {
    const parsedAlterations = parseAlterationName(name, true);
    return (
      <>
        {parsedAlterations.map((pAlt, index) => {
          return (
            <>
              <span>{buildAlterationName(pAlt.alteration, pAlt.name, pAlt.excluding)}</span>
              {pAlt.comment && <InfoIcon className="ms-1" overlay={pAlt.comment} />}
              {index < parsedAlterations.length - 1 && <span>, </span>}
            </>
          );
        })}
        {stringMutationBadges}
      </>
    );
  }
  return <span>{defaultName}</span>;
};

const mapStoreToProps = ({ flagStore }: IRootStore) => ({
  flags: flagStore.alterationCategoryFlags,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationCollapsibleTitle));
