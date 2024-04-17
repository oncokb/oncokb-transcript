package org.mskcc.oncokb.curation.config.application;

public class FrontendProperties {

    private FirebaseProperties firebase;

    public FirebaseProperties getFirebase() {
        return this.firebase;
    }

    public void setFirebase(FirebaseProperties firebase) {
        this.firebase = firebase;
    }

    private String sentryDsn;

    public String getSentryDsn() {
        return sentryDsn;
    }

    public void setSentryDsn(String sentryDsn) {
        this.sentryDsn = sentryDsn;
    }
}
