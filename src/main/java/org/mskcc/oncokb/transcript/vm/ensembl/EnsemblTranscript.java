package org.mskcc.oncokb.transcript.vm.ensembl;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class EnsemblTranscript extends EnsemblTranscriptFragment implements Serializable {

    @SerializedName("Exon")
    List<EnsemblTranscriptFragment> exons = new ArrayList<>();

    @SerializedName("UTR")
    List<EnsemblTranscriptFragment> utrs = new ArrayList<>();

    public List<EnsemblTranscriptFragment> getExons() {
        return exons;
    }

    public void setExons(List<EnsemblTranscriptFragment> exons) {
        this.exons = exons;
    }

    public List<EnsemblTranscriptFragment> getUtrs() {
        return utrs;
    }

    public void setUtrs(List<EnsemblTranscriptFragment> utrs) {
        this.utrs = utrs;
    }
}
