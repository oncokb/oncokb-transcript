package org.mskcc.oncokb.curation.domain.firebase;

import com.google.firebase.database.PropertyName;
import java.util.ArrayList;
import java.util.List;

public class Tumor {

    String summary;

    @PropertyName("TIs")
    List<TI> tis = new ArrayList<>();

    List<CancerType> cancerTypes;
    Implication diagnostic;
    String diagnosticSummary;
    Implication prognostic;
    String prognosticSummary;

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<TI> getTis() {
        return tis;
    }

    public void setTis(List<TI> tis) {
        this.tis = tis;
    }

    public List<CancerType> getCancerTypes() {
        return cancerTypes;
    }

    public void setCancerTypes(List<CancerType> cancerTypes) {
        this.cancerTypes = cancerTypes;
    }

    public Implication getDiagnostic() {
        return diagnostic;
    }

    public void setDiagnostic(Implication diagnostic) {
        this.diagnostic = diagnostic;
    }

    public String getDiagnosticSummary() {
        return diagnosticSummary;
    }

    public void setDiagnosticSummary(String diagnosticSummary) {
        this.diagnosticSummary = diagnosticSummary;
    }

    public Implication getPrognostic() {
        return prognostic;
    }

    public void setPrognostic(Implication prognostic) {
        this.prognostic = prognostic;
    }

    public String getPrognosticSummary() {
        return prognosticSummary;
    }

    public void setPrognosticSummary(String prognosticSummary) {
        this.prognosticSummary = prognosticSummary;
    }
}
