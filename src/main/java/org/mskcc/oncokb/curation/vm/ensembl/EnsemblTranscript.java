package org.mskcc.oncokb.curation.vm.ensembl;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class EnsemblTranscript extends EnsemblTranscriptFragment implements Serializable {

    @SerializedName("Parent")
    String parent;

    @SerializedName("Transcript")
    List<EnsemblTranscript> transcripts = new ArrayList<>();

    @SerializedName("Exon")
    List<EnsemblTranscriptFragment> exons = new ArrayList<>();

    @SerializedName("UTR")
    List<EnsemblTranscriptFragment> utrs = new ArrayList<>();

    public String getParent() {
        return parent;
    }

    public void setParent(String parent) {
        this.parent = parent;
    }

    public List<EnsemblTranscript> getTranscripts() {
        return transcripts;
    }

    public void setTranscripts(List<EnsemblTranscript> transcripts) {
        this.transcripts = transcripts;
    }

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
