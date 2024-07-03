package org.mskcc.oncokb.curation.domain.nih.efetch;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElements;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

/**
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = { "pubmedArticleOrPubmedBookArticle" })
@XmlRootElement(name = "PubmedArticleSet")
public class PubmedArticleSet {

    @XmlElements(
        {
            @XmlElement(name = "PubmedArticle", required = true, type = PubmedArticle.class),
            @XmlElement(name = "PubmedBookArticle", required = true, type = PubmedBookArticle.class),
        }
    )
    protected List<java.lang.Object> pubmedArticleOrPubmedBookArticle;

    /**
     * Gets the value of the pubmedArticleOrPubmedBookArticle property.
     *
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the pubmedArticleOrPubmedBookArticle property.
     *
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getPubmedArticleOrPubmedBookArticle().add(newItem);
     * </pre>
     *
     *
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link PubmedArticle }
     * {@link PubmedBookArticle }
     *
     *
     */
    public List<java.lang.Object> getPubmedArticleOrPubmedBookArticle() {
        if (pubmedArticleOrPubmedBookArticle == null) {
            pubmedArticleOrPubmedBookArticle = new ArrayList<java.lang.Object>();
        }
        return this.pubmedArticleOrPubmedBookArticle;
    }
}
