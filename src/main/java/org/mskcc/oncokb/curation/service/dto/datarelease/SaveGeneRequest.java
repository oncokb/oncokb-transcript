package org.mskcc.oncokb.curation.service.dto.datarelease;

import java.util.List;

public class SaveGeneRequest {

    private List<Integer> entrezGeneIds;

    /**
     * When true, saves the data as it is currently curated in Firebase (unreviewed edits
     * retained) to the preview core, instead of reverting fields to their lastReviewed value.
     */
    private boolean preview;

    public List<Integer> getEntrezGeneIds() {
        return entrezGeneIds;
    }

    public void setEntrezGeneIds(List<Integer> entrezGeneIds) {
        this.entrezGeneIds = entrezGeneIds;
    }

    public boolean isPreview() {
        return preview;
    }

    public void setPreview(boolean preview) {
        this.preview = preview;
    }
}
