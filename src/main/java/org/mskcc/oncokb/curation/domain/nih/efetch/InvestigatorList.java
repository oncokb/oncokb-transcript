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
@XmlType(name = "", propOrder = { "investigator" })
@XmlRootElement(name = "InvestigatorList")
public class InvestigatorList {

    @XmlElement(name = "Investigator", required = true)
    protected List<Investigator> investigator;

    /**
     * Gets the value of the investigator property.
     *
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the investigator property.
     *
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getInvestigator().add(newItem);
     * </pre>
     *
     *
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link Investigator }
     *
     *
     */
    public List<Investigator> getInvestigator() {
        if (investigator == null) {
            investigator = new ArrayList<Investigator>();
        }
        return this.investigator;
    }
}
