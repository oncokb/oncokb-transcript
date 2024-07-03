package org.mskcc.oncokb.curation.domain.nih.efetch;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

/**
 *
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = { "medlineCitation", "deleteCitation" })
@XmlRootElement(name = "MedlineCitationSet")
public class MedlineCitationSet {

    @XmlElement(name = "MedlineCitation")
    protected List<MedlineCitation> medlineCitation;

    @XmlElement(name = "DeleteCitation")
    protected DeleteCitation deleteCitation;

    /**
     * Gets the value of the medlineCitation property.
     *
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the medlineCitation property.
     *
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getMedlineCitation().add(newItem);
     * </pre>
     *
     *
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link MedlineCitation }
     *
     *
     */
    public List<MedlineCitation> getMedlineCitation() {
        if (medlineCitation == null) {
            medlineCitation = new ArrayList<MedlineCitation>();
        }
        return this.medlineCitation;
    }

    /**
     * Gets the value of the deleteCitation property.
     *
     * @return
     *     possible object is
     *     {@link DeleteCitation }
     *
     */
    public DeleteCitation getDeleteCitation() {
        return deleteCitation;
    }

    /**
     * Sets the value of the deleteCitation property.
     *
     * @param value
     *     allowed object is
     *     {@link DeleteCitation }
     *
     */
    public void setDeleteCitation(DeleteCitation value) {
        this.deleteCitation = value;
    }
}
