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
@XmlType(name = "", propOrder = { "bookDocument", "pubmedBookData" })
@XmlRootElement(name = "PubmedBookArticle")
public class PubmedBookArticle {

    @XmlElement(name = "BookDocument", required = true)
    protected BookDocument bookDocument;

    @XmlElement(name = "PubmedBookData")
    protected PubmedBookData pubmedBookData;

    /**
     * Gets the value of the bookDocument property.
     *
     * @return
     *     possible object is
     *     {@link BookDocument }
     *
     */
    public BookDocument getBookDocument() {
        return bookDocument;
    }

    /**
     * Sets the value of the bookDocument property.
     *
     * @param value
     *     allowed object is
     *     {@link BookDocument }
     *
     */
    public void setBookDocument(BookDocument value) {
        this.bookDocument = value;
    }

    /**
     * Gets the value of the pubmedBookData property.
     *
     * @return
     *     possible object is
     *     {@link PubmedBookData }
     *
     */
    public PubmedBookData getPubmedBookData() {
        return pubmedBookData;
    }

    /**
     * Sets the value of the pubmedBookData property.
     *
     * @param value
     *     allowed object is
     *     {@link PubmedBookData }
     *
     */
    public void setPubmedBookData(PubmedBookData value) {
        this.pubmedBookData = value;
    }
}
