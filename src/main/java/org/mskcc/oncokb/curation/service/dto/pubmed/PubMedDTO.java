package org.mskcc.oncokb.curation.service.dto.pubmed;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.domain.Flag;
import org.mskcc.oncokb.curation.domain.Synonym;
import org.mskcc.oncokb.curation.domain.enumeration.ArticleType;
import org.mskcc.oncokb.curation.util.GsonUtils;

public class PubMedDTO implements Serializable {

    private Long id;

    private ArticleType type = ArticleType.PUBMED;

    private String pmid;

    private String title;

    private String content;

    private String link;

    private String authors;

    private Instant date;

    private AdditionalInfoDTO additionalInfo;

    @JsonIgnoreProperties(value = { "alterations", "articles", "drugs", "genes", "transcripts" }, allowSetters = true)
    private Set<Flag> flags = new HashSet<>();

    @JsonIgnoreProperties(value = { "articles", "cancerTypes", "genes", "nciThesauruses" }, allowSetters = true)
    private Set<Synonym> synonyms = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ArticleType getType() {
        return type;
    }

    public void setType(ArticleType type) {
        this.type = type;
    }

    public String getPmid() {
        return pmid;
    }

    public void setPmid(String pmid) {
        this.pmid = pmid;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getAuthors() {
        return authors;
    }

    public void setAuthors(String authors) {
        this.authors = authors;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public AdditionalInfoDTO getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(AdditionalInfoDTO additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    public Set<Flag> getFlags() {
        return flags;
    }

    public void setFlags(Set<Flag> flags) {
        this.flags = flags;
    }

    public Set<Synonym> getSynonyms() {
        return synonyms;
    }

    public void setSynonyms(Set<Synonym> synonyms) {
        this.synonyms = synonyms;
    }

    public PubMedDTO() {}

    public PubMedDTO(Article article) {
        this.id = article.getId();
        this.type = article.getType();
        this.pmid = article.getUid();
        this.title = article.getTitle();
        this.content = article.getContent();
        this.link = article.getLink();
        this.authors = article.getAuthors();
        this.date = article.getDate();
        this.additionalInfo = GsonUtils.create().fromJson(article.getAdditionalInfo(), AdditionalInfoDTO.class);
        this.flags = article.getFlags();
        this.synonyms = article.getSynonyms();
    }
}
