package org.mskcc.oncokb.curation.domain.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import org.mskcc.oncokb.curation.domain.Alteration;

public class HotspotDTO implements Serializable {

    String type;
    String alteration;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getAlteration() {
        return alteration;
    }

    public void setAlteration(String alteration) {
        this.alteration = alteration;
    }
}
