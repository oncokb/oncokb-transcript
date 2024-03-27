package org.mskcc.oncokb.curation.service.dto.pubmed;

import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class AdditionalInfoDTO implements Serializable {

    private List<AbstractTextDTO> abstractTexts = new ArrayList<>();
    private JournalDTO journal;
    private Instant completedDate;
    private Instant revisedDate;
    private List<DataBankDTO> dataBanks = new ArrayList<>();

    public List<AbstractTextDTO> getAbstractTexts() {
        return abstractTexts;
    }

    public void setAbstractTexts(List<AbstractTextDTO> abstractTexts) {
        this.abstractTexts = abstractTexts;
    }

    public JournalDTO getJournal() {
        return journal;
    }

    public void setJournal(JournalDTO journal) {
        this.journal = journal;
    }

    public Instant getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(Instant completedDate) {
        this.completedDate = completedDate;
    }

    public Instant getRevisedDate() {
        return revisedDate;
    }

    public void setRevisedDate(Instant revisedDate) {
        this.revisedDate = revisedDate;
    }

    public List<DataBankDTO> getDataBanks() {
        return dataBanks;
    }

    public void setDataBanks(List<DataBankDTO> dataBanks) {
        this.dataBanks = dataBanks;
    }

    public void addDataBank(DataBankDTO dataBank) {
        this.dataBanks.add(dataBank);
    }
}
