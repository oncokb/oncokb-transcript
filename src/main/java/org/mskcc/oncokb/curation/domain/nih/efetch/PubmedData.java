package org.mskcc.oncokb.curation.domain.nih.efetch;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

/**
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = { "history", "publicationStatus", "articleIdList", "objectList" })
@XmlRootElement(name = "PubmedData")
public class PubmedData {

    @XmlElement(name = "History")
    protected History history;

    @XmlElement(name = "PublicationStatus", required = true)
    protected String publicationStatus;

    @XmlElement(name = "ArticleIdList", required = true)
    protected ArticleIdList articleIdList;

    @XmlElement(name = "ObjectList")
    protected ObjectList objectList;

    /**
     * Gets the value of the history property.
     *
     * @return
     *     possible object is
     *     {@link History }
     *
     */
    public History getHistory() {
        return history;
    }

    /**
     * Sets the value of the history property.
     *
     * @param value
     *     allowed object is
     *     {@link History }
     *
     */
    public void setHistory(History value) {
        this.history = value;
    }

    /**
     * Gets the value of the publicationStatus property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getPublicationStatus() {
        return publicationStatus;
    }

    /**
     * Sets the value of the publicationStatus property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setPublicationStatus(String value) {
        this.publicationStatus = value;
    }

    /**
     * Gets the value of the articleIdList property.
     *
     * @return
     *     possible object is
     *     {@link ArticleIdList }
     *
     */
    public ArticleIdList getArticleIdList() {
        return articleIdList;
    }

    /**
     * Sets the value of the articleIdList property.
     *
     * @param value
     *     allowed object is
     *     {@link ArticleIdList }
     *
     */
    public void setArticleIdList(ArticleIdList value) {
        this.articleIdList = value;
    }

    /**
     * Gets the value of the objectList property.
     *
     * @return
     *     possible object is
     *     {@link ObjectList }
     *
     */
    public ObjectList getObjectList() {
        return objectList;
    }

    /**
     * Sets the value of the objectList property.
     *
     * @param value
     *     allowed object is
     *     {@link ObjectList }
     *
     */
    public void setObjectList(ObjectList value) {
        this.objectList = value;
    }
}
