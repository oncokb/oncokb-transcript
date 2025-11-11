package org.mskcc.oncokb.curation.service.dto.datarelease;

import java.util.List;

public class SaveGeneResponse {

    private List<Integer> queued;
    private List<Integer> skipped;

    public List<Integer> getQueued() {
        return queued;
    }

    public void setQueued(List<Integer> queued) {
        this.queued = queued;
    }

    public List<Integer> getSkipped() {
        return skipped;
    }

    public void setSkipped(List<Integer> skipped) {
        this.skipped = skipped;
    }
}
