package org.mskcc.oncokb.curation.service.dto;

public class ClustalOResp {

    String fasta;
    String clustalo;

    String mview;

    public String getFasta() {
        return fasta;
    }

    public void setFasta(String fasta) {
        this.fasta = fasta;
    }

    public String getClustalo() {
        return clustalo;
    }

    public void setClustalo(String clustalo) {
        this.clustalo = clustalo;
    }

    public String getMview() {
        return mview;
    }

    public void setMview(String mview) {
        this.mview = mview;
    }
}
