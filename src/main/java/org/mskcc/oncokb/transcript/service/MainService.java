package org.mskcc.oncokb.transcript.service;

import org.springframework.stereotype.Service;

@Service
public class MainService {
    OncoKbUrlService oncoKbUrlService;

    public MainService(OncoKbUrlService oncoKbUrlService) {
        this.oncoKbUrlService = oncoKbUrlService;
    }


}
