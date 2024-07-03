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
import javax.xml.bind.annotation.adapters.NormalizedStringAdapter;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

/**
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = { "abstractText", "copyrightInformation" })
@XmlRootElement(name = "OtherAbstract")
public class OtherAbstract {

    @XmlAttribute(name = "Type", required = true)
    @XmlJavaTypeAdapter(CollapsedStringAdapter.class)
    protected String type;

    @XmlAttribute(name = "Language")
    @XmlJavaTypeAdapter(NormalizedStringAdapter.class)
    protected String language;

    @XmlElement(name = "AbstractText", required = true)
    protected List<AbstractText> abstractText;

    @XmlElement(name = "CopyrightInformation")
    protected String copyrightInformation;

    /**
     * Gets the value of the type property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getType() {
        return type;
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
     * Gets the value of the language property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getLanguage() {
        if (language == null) {
            return "eng";
        } else {
            return language;
        }
    }

    /**
     * Sets the value of the language property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setLanguage(String value) {
        this.language = value;
    }

    /**
     * Gets the value of the abstractText property.
     *
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the abstractText property.
     *
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getAbstractText().add(newItem);
     * </pre>
     *
     *
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link AbstractText }
     *
     *
     */
    public List<AbstractText> getAbstractText() {
        if (abstractText == null) {
            abstractText = new ArrayList<AbstractText>();
        }
        return this.abstractText;
    }

    /**
     * Gets the value of the copyrightInformation property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getCopyrightInformation() {
        return copyrightInformation;
    }

    /**
     * Sets the value of the copyrightInformation property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setCopyrightInformation(String value) {
        this.copyrightInformation = value;
    }
}
