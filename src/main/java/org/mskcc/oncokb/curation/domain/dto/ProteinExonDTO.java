package org.mskcc.oncokb.curation.domain.dto;

import java.io.Serializable;
import org.mskcc.oncokb.curation.model.IntegerRange;

public class ProteinExonDTO implements Serializable {

    IntegerRange range;
    Integer exon;

    public IntegerRange getRange() {
        return range;
    }

    public void setRange(IntegerRange range) {
        this.range = range;
    }

    public Integer getExon() {
        return exon;
    }

    public void setExon(Integer exon) {
        this.exon = exon;
    }
}
