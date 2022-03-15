package org.mskcc.oncokb.curation.config.model;

/**
 * Created by Hongxin Zhang on 1/29/21.
 */
public class OncoKbConfig {

    String apiKey;
    String url;

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
