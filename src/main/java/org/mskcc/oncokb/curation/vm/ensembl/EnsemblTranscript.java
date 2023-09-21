package org.mskcc.oncokb.curation.vm.ensembl;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class EnsemblTranscript extends EnsemblTranscriptFragment implements Serializable {

    @SerializedName("Parent")
    String parent;

    Integer version;

    @SerializedName("Translation")
    EnsemblTranscript transcription;

    @SerializedName("canonical_transcript")
    String canonicalTranscript;

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

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public EnsemblTranscript getTranscription() {
        return transcription;
    }

    public void setTranscription(EnsemblTranscript transcription) {
        this.transcription = transcription;
    }

    public String getCanonicalTranscript() {
        return canonicalTranscript;
    }

    public void setCanonicalTranscript(String canonicalTranscript) {
        this.canonicalTranscript = canonicalTranscript;
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
