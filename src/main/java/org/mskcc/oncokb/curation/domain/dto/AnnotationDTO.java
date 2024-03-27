package org.mskcc.oncokb.curation.domain.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class AnnotationDTO implements Serializable {

    HotspotInfoDTO hotspot = new HotspotInfoDTO();
    List<ProteinExonDTO> exons = new ArrayList<>();

    public HotspotInfoDTO getHotspot() {
        return hotspot;
    }

    public void setHotspot(HotspotInfoDTO hotspot) {
        this.hotspot = hotspot;
    }

    public List<ProteinExonDTO> getExons() {
        return exons;
    }

    public void setExons(List<ProteinExonDTO> exons) {
        this.exons = exons;
    }
}
