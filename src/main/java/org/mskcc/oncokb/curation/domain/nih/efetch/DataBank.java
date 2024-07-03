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
@XmlType(name = "", propOrder = { "dataBankName", "accessionNumberList" })
@XmlRootElement(name = "DataBank")
public class DataBank {

    @XmlElement(name = "DataBankName", required = true)
    protected String dataBankName;

    @XmlElement(name = "AccessionNumberList")
    protected AccessionNumberList accessionNumberList;

    /**
     * Gets the value of the dataBankName property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getDataBankName() {
        return dataBankName;
    }

    /**
     * Sets the value of the dataBankName property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setDataBankName(String value) {
        this.dataBankName = value;
    }

    /**
     * Gets the value of the accessionNumberList property.
     *
     * @return
     *     possible object is
     *     {@link AccessionNumberList }
     *
     */
    public AccessionNumberList getAccessionNumberList() {
        return accessionNumberList;
    }

    /**
     * Sets the value of the accessionNumberList property.
     *
     * @param value
     *     allowed object is
     *     {@link AccessionNumberList }
     *
     */
    public void setAccessionNumberList(AccessionNumberList value) {
        this.accessionNumberList = value;
    }
}
