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
@XmlRootElement(name = "ELocationID")
public class ELocationID {

    @XmlAttribute(name = "EIdType", required = true)
    @XmlJavaTypeAdapter(CollapsedStringAdapter.class)
    protected String eIdType;

    @XmlAttribute(name = "ValidYN")
    @XmlJavaTypeAdapter(CollapsedStringAdapter.class)
    protected String validYN;

    @XmlValue
    protected String value;

    /**
     * Gets the value of the eIdType property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getEIdType() {
        return eIdType;
    }

    /**
     * Sets the value of the eIdType property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setEIdType(String value) {
        this.eIdType = value;
    }

    /**
     * Gets the value of the validYN property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getValidYN() {
        if (validYN == null) {
            return "Y";
        } else {
            return validYN;
        }
    }

    /**
     * Sets the value of the validYN property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setValidYN(String value) {
        this.validYN = value;
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
