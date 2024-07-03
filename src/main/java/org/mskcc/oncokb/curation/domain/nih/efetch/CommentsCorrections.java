package org.mskcc.oncokb.curation.domain.nih.efetch;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.adapters.CollapsedStringAdapter;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

/**
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = { "refSource", "pmid", "note" })
@XmlRootElement(name = "CommentsCorrections")
public class CommentsCorrections {

    @XmlAttribute(name = "RefType", required = true)
    @XmlJavaTypeAdapter(CollapsedStringAdapter.class)
    protected String refType;

    @XmlElement(name = "RefSource", required = true)
    protected String refSource;

    @XmlElement(name = "PMID")
    protected PMID pmid;

    @XmlElement(name = "Note")
    protected String note;

    /**
     * Gets the value of the refType property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getRefType() {
        return refType;
    }

    /**
     * Sets the value of the refType property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setRefType(String value) {
        this.refType = value;
    }

    /**
     * Gets the value of the refSource property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getRefSource() {
        return refSource;
    }

    /**
     * Sets the value of the refSource property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setRefSource(String value) {
        this.refSource = value;
    }

    /**
     * Gets the value of the pmid property.
     *
     * @return
     *     possible object is
     *     {@link PMID }
     *
     */
    public PMID getPMID() {
        return pmid;
    }

    /**
     * Sets the value of the pmid property.
     *
     * @param value
     *     allowed object is
     *     {@link PMID }
     *
     */
    public void setPMID(PMID value) {
        this.pmid = value;
    }

    /**
     * Gets the value of the note property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getNote() {
        return note;
    }

    /**
     * Sets the value of the note property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setNote(String value) {
        this.note = value;
    }
}
