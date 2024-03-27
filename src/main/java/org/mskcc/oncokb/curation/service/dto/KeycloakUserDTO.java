package org.mskcc.oncokb.curation.service.dto;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;
import java.time.Instant;

/* User returned from Keycloak */

public class KeycloakUserDTO implements Serializable {

    private String uid;

    private String sub;

    @SerializedName("preferred_username")
    private String preferredUserName;

    @SerializedName("given_name")
    private String givenName;

    @SerializedName("family_name")
    private String familyName;

    private String name;

    private String email;

    private String langKey;

    private String locale;

    @SerializedName("picture")
    private String imageUrl;

    @SerializedName("updated_at")
    private Instant lastUpdate;

    public String getUid() {
        return this.uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getSub() {
        return this.sub;
    }

    public void setSub(String sub) {
        this.sub = sub;
    }

    public String getPreferredUserName() {
        return this.preferredUserName;
    }

    public void setPreferredUserName(String preferredUserName) {
        this.preferredUserName = preferredUserName;
    }

    public String getGivenName() {
        return this.givenName;
    }

    public void setGivenName(String givenName) {
        this.givenName = givenName;
    }

    public String getFamilyName() {
        return this.familyName;
    }

    public void setFamilyName(String familyName) {
        this.familyName = familyName;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLangKey() {
        return this.langKey;
    }

    public void setLangKey(String langKey) {
        this.langKey = langKey;
    }

    public String getLocale() {
        return this.locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public String getImageUrl() {
        return this.imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Instant getLastUpdate() {
        return this.lastUpdate;
    }

    public void setLastUpdate(Instant lastUpdate) {
        this.lastUpdate = lastUpdate;
    }
}
