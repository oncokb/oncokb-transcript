package org.mskcc.oncokb.curation.domain.nih.efetch;

import java.util.ArrayList;
import java.util.List;
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
@XmlType(name = "", propOrder = { "author" })
@XmlRootElement(name = "AuthorList")
public class AuthorList {

    @XmlAttribute(name = "CompleteYN")
    @XmlJavaTypeAdapter(CollapsedStringAdapter.class)
    protected String completeYN;

    @XmlAttribute(name = "Type")
    @XmlJavaTypeAdapter(CollapsedStringAdapter.class)
    protected String type;

    @XmlElement(name = "Author", required = true)
    protected List<Author> author;

    /**
     * Gets the value of the completeYN property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getCompleteYN() {
        if (completeYN == null) {
            return "Y";
        } else {
            return completeYN;
        }
    }

    /**
     * Sets the value of the completeYN property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setCompleteYN(String value) {
        this.completeYN = value;
    }

    /**
     * Gets the value of the type property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getType() {
        if (type == null) {
            return "authors";
        } else {
            return type;
        }
    }

    /**
     * Sets the value of the type property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setType(String value) {
        this.type = value;
    }

    /**
     * Gets the value of the author property.
     *
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the author property.
     *
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getAuthor().add(newItem);
     * </pre>
     *
     *
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Author }
     *
     *
     */
    public List<Author> getAuthor() {
        if (author == null) {
            author = new ArrayList<Author>();
        }
        return this.author;
    }
}
