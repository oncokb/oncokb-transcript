package org.mskcc.oncokb.curation.domain.nih.efetch;

import java.util.List;
import javax.xml.bind.annotation.*;
import javax.xml.bind.annotation.adapters.NormalizedStringAdapter;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

/**
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = { "value" })
@XmlRootElement(name = "ArticleTitle")
public class ArticleTitle {

    @XmlAttribute(name = "book")
    @XmlJavaTypeAdapter(NormalizedStringAdapter.class)
    protected String book;

    @XmlAttribute(name = "part")
    @XmlJavaTypeAdapter(NormalizedStringAdapter.class)
    protected String part;

    @XmlAttribute(name = "sec")
    @XmlJavaTypeAdapter(NormalizedStringAdapter.class)
    protected String sec;

    @XmlMixed
    @XmlAnyElement
    protected List<java.lang.Object> value;

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

    public List<java.lang.Object> getValue() {
        return value;
    }

    public void setValue(List<java.lang.Object> value) {
        this.value = value;
    }
}
