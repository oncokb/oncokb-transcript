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
@XmlType(name = "", propOrder = { "registryNumber", "nameOfSubstance" })
@XmlRootElement(name = "Chemical")
public class Chemical {

    @XmlElement(name = "RegistryNumber", required = true)
    protected String registryNumber;

    @XmlElement(name = "NameOfSubstance", required = true)
    protected String nameOfSubstance;

    /**
     * Gets the value of the registryNumber property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getRegistryNumber() {
        return registryNumber;
    }

    /**
     * Sets the value of the registryNumber property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setRegistryNumber(String value) {
        this.registryNumber = value;
    }

    /**
     * Gets the value of the nameOfSubstance property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getNameOfSubstance() {
        return nameOfSubstance;
    }

    /**
     * Sets the value of the nameOfSubstance property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setNameOfSubstance(String value) {
        this.nameOfSubstance = value;
    }
}
