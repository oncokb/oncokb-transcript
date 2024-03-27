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
@XmlType(name = "", propOrder = { "lastName", "foreName", "initials", "suffix" })
@XmlRootElement(name = "PersonalNameSubject")
public class PersonalNameSubject {

    @XmlElement(name = "LastName", required = true)
    protected LastName lastName;

    @XmlElement(name = "ForeName")
    protected ForeName foreName;

    @XmlElement(name = "Initials")
    protected Initials initials;

    @XmlElement(name = "Suffix")
    protected Suffix suffix;

    /**
     * Gets the value of the lastName property.
     *
     * @return
     *     possible object is
     *     {@link LastName }
     *
     */
    public LastName getLastName() {
        return lastName;
    }

    /**
     * Sets the value of the lastName property.
     *
     * @param value
     *     allowed object is
     *     {@link LastName }
     *
     */
    public void setLastName(LastName value) {
        this.lastName = value;
    }

    /**
     * Gets the value of the foreName property.
     *
     * @return
     *     possible object is
     *     {@link ForeName }
     *
     */
    public ForeName getForeName() {
        return foreName;
    }

    /**
     * Sets the value of the foreName property.
     *
     * @param value
     *     allowed object is
     *     {@link ForeName }
     *
     */
    public void setForeName(ForeName value) {
        this.foreName = value;
    }

    /**
     * Gets the value of the initials property.
     *
     * @return
     *     possible object is
     *     {@link Initials }
     *
     */
    public Initials getInitials() {
        return initials;
    }

    /**
     * Sets the value of the initials property.
     *
     * @param value
     *     allowed object is
     *     {@link Initials }
     *
     */
    public void setInitials(Initials value) {
        this.initials = value;
    }

    /**
     * Gets the value of the suffix property.
     *
     * @return
     *     possible object is
     *     {@link Suffix }
     *
     */
    public Suffix getSuffix() {
        return suffix;
    }

    /**
     * Sets the value of the suffix property.
     *
     * @param value
     *     allowed object is
     *     {@link Suffix }
     *
     */
    public void setSuffix(Suffix value) {
        this.suffix = value;
    }
}
