package org.mskcc.oncokb.curation.vm.ensembl;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class EnsemblTranscriptFragment implements Serializable {

    Integer strand;

    @SerializedName("seq_region_name")
    String seqRegionName;

    String id;
    Integer start;
    Integer end;

    @SerializedName("object_type")
    String type;

    public Integer getStrand() {
        return strand;
    }

    public void setStrand(Integer strand) {
        this.strand = strand;
    }

    public String getSeqRegionName() {
        return seqRegionName;
    }

    public void setSeqRegionName(String seqRegionName) {
        this.seqRegionName = seqRegionName;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
