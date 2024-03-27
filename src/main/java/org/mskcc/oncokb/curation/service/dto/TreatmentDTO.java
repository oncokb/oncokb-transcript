package org.mskcc.oncokb.curation.service.dto;

import java.util.ArrayList;
import java.util.List;
import org.mskcc.oncokb.curation.domain.Drug;

public class TreatmentDTO {

    public TreatmentDTO() {}

    List<Drug> drugs = new ArrayList<>();

    public List<Drug> getDrugs() {
        return drugs;
    }

    public void setDrugs(List<Drug> drugs) {
        this.drugs = drugs;
    }

    public void addDrug(Drug drug) {
        this.drugs.add(drug);
    }
}
