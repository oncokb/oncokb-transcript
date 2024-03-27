package org.mskcc.oncokb.curation.domain.nih.efetch;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.XmlValue;
import javax.xml.bind.annotation.adapters.NormalizedStringAdapter;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

/**
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = { "value" })
@XmlRootElement(name = "CollectionTitle")
public class CollectionTitle {

    @XmlAttribute(name = "book")
    @XmlJavaTypeAdapter(NormalizedStringAdapter.class)
    protected String book;

    @XmlAttribute(name = "part")
    @XmlJavaTypeAdapter(NormalizedStringAdapter.class)
    protected String part;

    @XmlAttribute(name = "sec")
    @XmlJavaTypeAdapter(NormalizedStringAdapter.class)
    protected String sec;

    @XmlValue
    protected String value;

    /**
     * Gets the value of the book property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getBook() {
        return book;
    }

    /**
     * Sets the value of the book property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setBook(String value) {
        this.book = value;
    }

    /**
     * Gets the value of the part property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getPart() {
        return part;
    }

    /**
     * Sets the value of the part property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setPart(String value) {
        this.part = value;
    }

    /**
     * Gets the value of the sec property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getSec() {
        return sec;
    }

    /**
     * Sets the value of the sec property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setSec(String value) {
        this.sec = value;
    }

    /**
     * Gets the value of the value property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getvalue() {
        return value;
    }

    /**
     * Sets the value of the value property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setvalue(String value) {
        this.value = value;
    }
}
