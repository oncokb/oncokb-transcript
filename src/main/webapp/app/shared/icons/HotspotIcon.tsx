import { HOTSPOT } from 'app/config/colors';
import React from 'react';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { getNCBIlink } from 'app/oncokb-commons/components/lib/urls';
import { Linkout } from 'app/shared/links/Linkout';
import { BsFire } from 'react-icons/bs';
import { HotspotDTO } from 'app/shared/api/generated';
import _ from 'lodash';
import InfoIcon from 'app/shared/icons/InfoIcon';

enum HotspotType {
  HOTSPOT_V1 = 'HOTSPOT_V1',
  THREE_D = 'THREE_D',
}

const getHotspotTypeName = (hotspotType: HotspotType) => {
  switch (hotspotType) {
    case HotspotType.HOTSPOT_V1:
      return 'Cancer Hotspots(v1)';
    case HotspotType.THREE_D:
      return '3D Hotspots';
    default:
      return '';
  }
};

const getHotspotDescription = (hotspotType: string) => {
  if (hotspotType === HotspotType.HOTSPOT_V1) {
    return (
      <div>
        Identified as a recurrent hotspot (statistically significant) in a population-scale cohort of tumor samples of various cancer types
        using methodology based in part on <Linkout to={getNCBIlink('/pubmed/29247016')}>Chang et al. 2017</Linkout> and{' '}
        <Linkout to={getNCBIlink('/pubmed/26619011')}>Chang et al. 2016</Linkout>.
      </div>
    );
  } else if (hotspotType === HotspotType.THREE_D) {
    return (
      <div>
        Mutations clustering in 3D protein structures identified in 11,119 tumor samples across 41 tumor types by the algorithm described in{' '}
        <Linkout to={getNCBIlink('/pubmed/28115009')}>Gao et al. 2017</Linkout>
      </div>
    );
  } else {
    return <span></span>;
  }
};

const getHotspotTooltipContent = (associatedHotspots: HotspotDTO[]) => {
  const groupedHotspot = associatedHotspots.reduce((acc, next) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!acc[next.type]) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      acc[next.type] = [];
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    acc[next.type].push(next.alteration);
    return acc;
  }, {});

  return (
    <div>
      {Object.keys(groupedHotspot).map(hotspotType => {
        return (
          <div key={hotspotType}>
            <b>{getHotspotTypeName(hotspotType as HotspotType)}</b>: {_.uniq(groupedHotspot[hotspotType]).join(', ')}{' '}
            <InfoIcon overlay={() => getHotspotDescription(hotspotType)} />
          </div>
        );
      })}
    </div>
  );
};
const HotspotIcon: React.FunctionComponent<{ associatedHotspots: HotspotDTO[] }> = props => {
  return (
    <DefaultTooltip overlay={() => getHotspotTooltipContent(props.associatedHotspots)}>
      <BsFire color={HOTSPOT} className={'mx-1'} />
    </DefaultTooltip>
  );
};

export default HotspotIcon;
