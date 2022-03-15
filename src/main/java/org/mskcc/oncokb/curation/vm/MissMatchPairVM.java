package org.mskcc.oncokb.curation.vm;

/**
 * Created by Hongxin Zhang on 10/22/20.
 */
public class MissMatchPairVM {

    int position;
    char referenceAllele;
    char targetAlelel;

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public char getReferenceAllele() {
        return referenceAllele;
    }

    public void setReferenceAllele(char referenceAllele) {
        this.referenceAllele = referenceAllele;
    }

    public char getTargetAlelel() {
        return targetAlelel;
    }

    public void setTargetAlelel(char targetAlelel) {
        this.targetAlelel = targetAlelel;
    }
}
