package org.mskcc.oncokb.curation.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import javax.persistence.*;

/**
 * A ArticleFullText.
 */
@Entity
@Table(name = "article_full_text")
@org.springframework.data.elasticsearch.annotations.Document(indexName = "articlefulltext")
public class ArticleFullText implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Lob
    @Column(name = "text")
    private String text;

    @Lob
    @Column(name = "html")
    private String html;

    @JsonIgnoreProperties(value = { "fullText" }, allowSetters = true)
    @OneToOne
    @JoinColumn(unique = true)
    private Article article;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ArticleFullText id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getText() {
        return this.text;
    }

    public ArticleFullText text(String text) {
        this.setText(text);
        return this;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getHtml() {
        return this.html;
    }

    public ArticleFullText html(String html) {
        this.setHtml(html);
        return this;
    }

    public void setHtml(String html) {
        this.html = html;
    }

    public Article getArticle() {
        return this.article;
    }

    public void setArticle(Article article) {
        this.article = article;
    }

    public ArticleFullText article(Article article) {
        this.setArticle(article);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ArticleFullText)) {
            return false;
        }
        return id != null && id.equals(((ArticleFullText) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ArticleFullText{" +
            "id=" + getId() +
            ", text='" + getText() + "'" +
            ", html='" + getHtml() + "'" +
            "}";
    }
}
