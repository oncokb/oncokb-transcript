package org.mskcc.oncokb.curation.domain.nih.efetch;

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
@XmlType(name = "", propOrder = { "year", "month", "day", "hour", "minute", "second" })
@XmlRootElement(name = "PubMedPubDate")
public class PubMedPubDate {

    @XmlAttribute(name = "PubStatus", required = true)
    @XmlJavaTypeAdapter(CollapsedStringAdapter.class)
    protected String pubStatus;

    @XmlElement(name = "Year", required = true)
    protected Year year;

    @XmlElement(name = "Month", required = true)
    protected Month month;

    @XmlElement(name = "Day", required = true)
    protected Day day;

    @XmlElement(name = "Hour")
    protected String hour;

    @XmlElement(name = "Minute")
    protected String minute;

    @XmlElement(name = "Second")
    protected String second;

    /**
     * Gets the value of the pubStatus property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getPubStatus() {
        return pubStatus;
    }

    /**
     * Sets the value of the pubStatus property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setPubStatus(String value) {
        this.pubStatus = value;
    }

    /**
     * Gets the value of the year property.
     *
     * @return
     *     possible object is
     *     {@link Year }
     *
     */
    public Year getYear() {
        return year;
    }

    /**
     * Sets the value of the year property.
     *
     * @param value
     *     allowed object is
     *     {@link Year }
     *
     */
    public void setYear(Year value) {
        this.year = value;
    }

    /**
     * Gets the value of the month property.
     *
     * @return
     *     possible object is
     *     {@link Month }
     *
     */
    public Month getMonth() {
        return month;
    }

    /**
     * Sets the value of the month property.
     *
     * @param value
     *     allowed object is
     *     {@link Month }
     *
     */
    public void setMonth(Month value) {
        this.month = value;
    }

    /**
     * Gets the value of the day property.
     *
     * @return
     *     possible object is
     *     {@link Day }
     *
     */
    public Day getDay() {
        return day;
    }

    /**
     * Sets the value of the day property.
     *
     * @param value
     *     allowed object is
     *     {@link Day }
     *
     */
    public void setDay(Day value) {
        this.day = value;
    }

    /**
     * Gets the value of the hour property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getHour() {
        return hour;
    }

    /**
     * Sets the value of the hour property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setHour(String value) {
        this.hour = value;
    }

    /**
     * Gets the value of the minute property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getMinute() {
        return minute;
    }

    /**
     * Sets the value of the minute property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setMinute(String value) {
        this.minute = value;
    }

    /**
     * Gets the value of the second property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getSecond() {
        return second;
    }

    /**
     * Sets the value of the second property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setSecond(String value) {
        this.second = value;
    }
}
