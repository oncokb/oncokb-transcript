package org.mskcc.oncokb.curation.domain.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class HotspotInfoDTO implements Serializable {

    Boolean isHotspot = false;
    List<HotspotDTO> associatedHotspots = new ArrayList<>();

    public Boolean getHotspot() {
        return isHotspot;
    }

    public void setHotspot(Boolean hotspot) {
        isHotspot = hotspot;
    }

    public List<HotspotDTO> getAssociatedHotspots() {
        return associatedHotspots;
    }

    public void setAssociatedHotspots(List<HotspotDTO> associatedHotspots) {
        this.associatedHotspots = associatedHotspots;
    }
}
