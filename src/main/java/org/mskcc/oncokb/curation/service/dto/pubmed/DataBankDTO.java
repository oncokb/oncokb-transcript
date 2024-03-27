package org.mskcc.oncokb.curation.service.dto.pubmed;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class DataBankDTO implements Serializable {

    private String name;

    private List<String> accessionNumbers = new ArrayList<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getAccessionNumbers() {
        return accessionNumbers;
    }

    public void setAccessionNumbers(List<String> accessionNumbers) {
        this.accessionNumbers = accessionNumbers;
    }
}
