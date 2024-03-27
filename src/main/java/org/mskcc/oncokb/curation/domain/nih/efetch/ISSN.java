package org.mskcc.oncokb.curation.domain.nih.efetch;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.XmlValue;
import javax.xml.bind.annotation.adapters.CollapsedStringAdapter;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

/**
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = { "value" })
@XmlRootElement(name = "ISSN")
public class ISSN {

    @XmlAttribute(name = "IssnType", required = true)
    @XmlJavaTypeAdapter(CollapsedStringAdapter.class)
    protected String issnType;

    @XmlValue
    protected String value;

    /**
     * Gets the value of the issnType property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getIssnType() {
        return issnType;
    }

    /**
     * Sets the value of the issnType property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setIssnType(String value) {
        this.issnType = value;
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
