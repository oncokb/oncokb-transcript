package org.mskcc.oncokb.curation.config.application;

public class FirebaseProperties {

    private String apiKey;

    private String authDomain;

    private String databaseUrl;

    private String projectId;

    private String storageBucket;

    private String messagingSenderId;

    private String appId;

    private String measurementId;

    private String serviceAccountCredentialsPath;

    public String getApiKey() {
        return this.apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getAuthDomain() {
        return this.authDomain;
    }

    public void setAuthDomain(String authDomain) {
        this.authDomain = authDomain;
    }

    public String getDatabaseUrl() {
        return this.databaseUrl;
    }

    public void setDatabaseUrl(String databaseUrl) {
        this.databaseUrl = databaseUrl;
    }

    public String getProjectId() {
        return this.projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getStorageBucket() {
        return this.storageBucket;
    }

    public void setStorageBucket(String storageBucket) {
        this.storageBucket = storageBucket;
    }

    public String getMessagingSenderId() {
        return this.messagingSenderId;
    }

    public void setMessagingSenderId(String messagingSenderId) {
        this.messagingSenderId = messagingSenderId;
    }

    public String getAppId() {
        return this.appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public String getMeasurementId() {
        return this.measurementId;
    }

    public void setMeasurementId(String measurementId) {
        this.measurementId = measurementId;
    }

    public String getServiceAccountCredentialsPath() {
        return this.serviceAccountCredentialsPath;
    }

    public void setServiceAccountCredentialsPath(String serviceAccountCredentialsPath) {
        this.serviceAccountCredentialsPath = serviceAccountCredentialsPath;
    }
}
