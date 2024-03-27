package org.mskcc.oncokb.curation.domain.firebase;

import java.util.ArrayList;
import java.util.List;

public class TI {

    String name;
    List<Treatment> treatments = new ArrayList<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Treatment> getTreatments() {
        return treatments;
    }

    public void setTreatments(List<Treatment> treatments) {
        this.treatments = treatments;
    }
}
