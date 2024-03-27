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
@XmlType(name = "", propOrder = { "medlineCitation", "pubmedData" })
@XmlRootElement(name = "PubmedArticle")
public class PubmedArticle {

    @XmlElement(name = "MedlineCitation", required = true)
    protected MedlineCitation medlineCitation;

    @XmlElement(name = "PubmedData")
    protected PubmedData pubmedData;

    /**
     * Gets the value of the medlineCitation property.
     *
     * @return
     *     possible object is
     *     {@link MedlineCitation }
     *
     */
    public MedlineCitation getMedlineCitation() {
        return medlineCitation;
    }

    /**
     * Sets the value of the medlineCitation property.
     *
     * @param value
     *     allowed object is
     *     {@link MedlineCitation }
     *
     */
    public void setMedlineCitation(MedlineCitation value) {
        this.medlineCitation = value;
    }

    /**
     * Gets the value of the pubmedData property.
     *
     * @return
     *     possible object is
     *     {@link PubmedData }
     *
     */
    public PubmedData getPubmedData() {
        return pubmedData;
    }

    /**
     * Sets the value of the pubmedData property.
     *
     * @param value
     *     allowed object is
     *     {@link PubmedData }
     *
     */
    public void setPubmedData(PubmedData value) {
        this.pubmedData = value;
    }
}
