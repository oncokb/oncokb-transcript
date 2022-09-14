package org.mskcc.oncokb.curation.importer;

import java.io.File;
import java.io.IOException;
import javax.xml.parsers.ParserConfigurationException;
import org.mskcc.oncokb.curation.service.ArticleService;
import org.mskcc.oncokb.curation.util.ProcessUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestTemplate;
import org.xml.sax.SAXException;

@Component
public class PubMedImporter {

    private static final Logger log = LoggerFactory.getLogger(PubMedImporter.class);

    ArticleService articleService;
    XMLParser parser;
    RestTemplate restTemplate;

    public PubMedImporter(ArticleService articleService, XMLParser parser, RestTemplateBuilder restTemplateBuilder) {
        this.articleService = articleService;
        this.parser = parser;
        this.restTemplate = restTemplateBuilder.build();
    }

    public boolean addArticlePMID(String pmId) {
        if (articleService.findByPmid(pmId).isPresent()) return false;
        try {
            String XMLfile = "pubmed_ids.xml";
            ProcessUtil.runScript("python3 python/pubmed_ids.py " + pmId);
            parser.reload(XMLfile);
            parser.DFS(parser.getRoot(), Tree.articleTree(), null);
            return true;
        } catch (IOException | ParserConfigurationException | SAXException | NoSuchFieldException | IllegalAccessException e) {
            log.error(e.getMessage());
            return false;
        }
    }
}
