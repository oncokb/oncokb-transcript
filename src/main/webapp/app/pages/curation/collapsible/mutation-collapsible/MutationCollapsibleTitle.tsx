import DefaultBadge from 'app/shared/badge/DefaultBadge';
import InfoIcon from 'app/shared/icons/InfoIcon';
import { Alteration, AlterationCategories } from 'app/shared/model/firebase/firebase.model';
import { getAlterationName, isFlagEqualToIFlag } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { buildAlterationName, getAlterationNameComponent, parseAlterationName } from 'app/shared/util/utils';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import React from 'react';
import * as styles from './styles.module.scss';
import classNames from 'classnames';
import WithSeparator from 'react-with-separator';

export interface IMutationCollapsibleTitle extends StoreProps {
  name: string | undefined;
  mutationAlterations: Alteration[] | null | undefined;
  alterationCategories: AlterationCategories | null;
}
const MutationCollapsibleTitle = ({ name, mutationAlterations, alterationCategories, flagEntities }: IMutationCollapsibleTitle) => {
  const defaultName = 'No Name';
  let stringMutationBadges: JSX.Element | undefined;
  const shouldGroupBadges =
    (alterationCategories?.flags?.length || 0) > 1 || (alterationCategories?.flags?.length === 1 && alterationCategories.comment !== '');

  if (alterationCategories?.flags && flagEntities) {
    const tooltipOverlay = alterationCategories.comment ? <span>{alterationCategories.comment}</span> : undefined;
    stringMutationBadges = (
      <div className={classNames(shouldGroupBadges ? styles.flagWrapper : undefined)}>
        {alterationCategories.flags.map(flag => {
          const matchedFlagEntity = flagEntities.find(flagEntity => isFlagEqualToIFlag(flag, flagEntity));
          return (
            <DefaultBadge
              key={matchedFlagEntity?.flag || flag.flag}
              color={'primary'}
              text={matchedFlagEntity?.name || flag.flag}
              tooltipOverlay={matchedFlagEntity?.description ? matchedFlagEntity.description : undefined}
            />
          );
        })}
        {tooltipOverlay ? <InfoIcon className="me-1" overlay={tooltipOverlay} /> : undefined}
      </div>
    );
  }

  if (mutationAlterations) {
    return (
      <>
        <WithSeparator separator={', '}>
          {mutationAlterations.map((alteration, index) =>
            getAlterationNameComponent(getAlterationName(alteration, true), alteration.comment),
          )}
        </WithSeparator>
        {stringMutationBadges}
      </>
    );
  }

  if (name) {
    const parsedAlterations = parseAlterationName(name, true);
    return (
      <>
        <WithSeparator separator={', '}>
          {parsedAlterations.map(pAlt =>
            getAlterationNameComponent(buildAlterationName(pAlt.alteration, pAlt.name, pAlt.excluding), pAlt.comment),
          )}
        </WithSeparator>
        {stringMutationBadges}
      </>
    );
  }

  return <span>{defaultName}</span>;
};

const mapStoreToProps = ({ flagStore }: IRootStore) => ({
  flagEntities: flagStore.alterationCategoryFlags,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationCollapsibleTitle));
