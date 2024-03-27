package org.mskcc.oncokb.curation.model;

import java.io.Serializable;

public class IntegerRange implements Serializable {

    private Integer start = null;
    private Integer end = null;

    public Integer getStart() {
        return start;
    }

    public void setStart(Integer start) {
        this.start = start;
    }

    public Integer getEnd() {
        return end;
    }

    public void setEnd(Integer end) {
        this.end = end;
    }
}
