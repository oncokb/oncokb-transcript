package org.mskcc.cbio.web.rest.vm;

import org.genome_nexus.client.EnsemblTranscript;

/**
 * Created by Hongxin Zhang on 7/15/20.
 */
public class TranscriptMatchResultVM {
    String note;
    EnsemblTranscript ensemblTranscript;

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public EnsemblTranscript getEnsemblTranscript() {
        return ensemblTranscript;
    }

    public void setEnsemblTranscript(EnsemblTranscript ensemblTranscript) {
        this.ensemblTranscript = ensemblTranscript;
    }
}
