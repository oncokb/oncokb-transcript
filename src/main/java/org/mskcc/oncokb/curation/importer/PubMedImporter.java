package org.mskcc.oncokb.curation.importer;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.domain.ArticleFullText;
import org.mskcc.oncokb.curation.service.ArticleFullTextService;
import org.mskcc.oncokb.curation.service.ArticleService;
import org.mskcc.oncokb.curation.service.S3Service;
import org.mskcc.oncokb.curation.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.xml.sax.SAXException;

@Component
public class PubMedImporter {

    private static final Logger log = LoggerFactory.getLogger(PubMedImporter.class);

    ArticleService articleService;
    ArticleFullTextService articleFullTextService;
    S3Service s3Service;
    XMLParser parser;

    public PubMedImporter(
        ArticleService articleService,
        ArticleFullTextService articleFullTextService,
        S3Service s3Service,
        XMLParser parser
    ) {
        this.articleService = articleService;
        this.articleFullTextService = articleFullTextService;
        this.s3Service = s3Service;
        this.parser = parser;
    }

    public String getScriptDirectoryPath() {
        Path path = FileUtils.getResourcePath("script");
        return path == null ? null : path.toString();
    }

    public String getScriptPath(String scriptName) {
        String scriptPath = getScriptDirectoryPath();
        return scriptPath == null ? null : (scriptPath + "/" + scriptName);
    }

    public String getPythonScriptPath(String scriptName) {
        String scriptPath = getScriptDirectoryPath();
        return scriptPath == null ? null : (scriptPath + "/python/" + scriptName);
    }

    public Path getPublicationPath(String pmid) {
        return Path.of("publication/" + pmid);
    }

    public Path getPmcZipPath(String pmid) {
        Path filePath = Path.of("publication/" + pmid + ".zip");
        if (filePath == null) {
            Path directoryPath = Path.of("publication");
            return Path.of(directoryPath.toString() + "/" + pmid + ".zip");
        } else {
            return filePath;
        }
    }

    public boolean addArticlePMID(String pmid) {
        //        if (articleService.findByPmid(pmid).isPresent()) return false;
        try {
            Path XmlPath = getPublicationPath(pmid + ".xml");
            ProcessUtil.runScript(getPyScriptExecCommand("pubmed_ids.py", pmid, XmlPath.toString()));
            parser.reload(XmlPath.toString());
            parser.DFS(parser.getRoot(), Tree.articleTree(), null);
            Files.deleteIfExists(XmlPath);
            return true;
        } catch (IOException | ParserConfigurationException | SAXException | NoSuchFieldException | IllegalAccessException e) {
            log.error(e.getMessage());
            return false;
        }
    }

    public boolean uploadArticleFullTextToS3(String pmid) throws FileNotFoundException {
        try {
            String sourcePath = "publication/" + pmid;
            String compressPath = sourcePath + ".zip";
            String s3ObjPath = "curation-website/article-full-text/" + pmid + ".zip";
            GzipUtils.compress(getPublicationPath(pmid), getPmcZipPath(pmid));
            Path path = Path.of(compressPath);
            if (Files.exists(path)) {
                s3Service.saveObject("oncokb", s3ObjPath, path.toFile());
                path.toFile().delete();
            }
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    public void removePublicationIfExist(String pmid) {
        Path pubDirectory = getPublicationPath(pmid);
        if (Files.exists(pubDirectory)) {
            FileUtils.deleteDirectory(pubDirectory.toFile());
        }
    }

    public boolean addArticleFullText(String pmid) {
        try {
            boolean found = true;
            if (!Files.exists(getPublicationPath(pmid))) {
                found = fetchArticlePdf(pmid);
            }
            if (!found) return false;
            Path pubDirectory = getPublicationPath(pmid);

            Stream<Path> walk = Files.walk(pubDirectory);
            List<String> files = walk.filter(p -> !Files.isDirectory(p)).map(Path::toString).collect(Collectors.toList());
            if (files.size() == 0) return false;
            walk = Files.walk(pubDirectory);

            files =
                walk
                    .filter(p -> !Files.isDirectory(p))
                    .map(Path::toString)
                    .filter(s -> !s.endsWith(".tar.gz") && !s.endsWith(".pdf"))
                    .collect(Collectors.toList());
            walk = Files.walk(pubDirectory);
            List<String> PDFfiles = walk
                .filter(p -> !Files.isDirectory(p))
                .map(Path::toString)
                .filter(s -> s.endsWith(".pdf"))
                .collect(Collectors.toList());
            if (PDFfiles.size() > 1) {
                for (int i = 0; i < PDFfiles.size(); i++) for (int j = i + 1; j < PDFfiles.size(); j++) {
                    if (new File(PDFfiles.get(i)).length() == new File(PDFfiles.get(j)).length()) {
                        PDFfiles.remove(j);
                        j--;
                    }
                }
                PDFfiles.sort(Comparator.comparingInt(String::length));
                log.info(PDFfiles.toString());
            }
            Optional<Article> articleOptional = articleService.findByPmid(pmid);
            if (articleOptional.isEmpty()) {
                log.info("Article {} does not exist, please import it first.", pmid);
                return false;
            }
            Optional<ArticleFullText> articleFullTextOptional = articleFullTextService.findByArticle(articleOptional.get());
            if (articleFullTextOptional.isPresent()) {
                log.info("ArticleFullText already exists for article {}", pmid);
                return false;
            }
            ArticleFullText fullText = new ArticleFullText();
            fullText.setArticle(articleOptional.get());

            for (int i = 0; i < PDFfiles.size(); i++) {
                if (i == 0) {
                    log.info("Analyzing " + PDFfiles.get(0));
                    fullText.setText(TikaTool.parseDocument(PDFfiles.get(0)));
                    fullText.setHtml(TikaTool.parseDocumentHTML(PDFfiles.get(0)));
                }
            }

            articleFullTextService.save(fullText);

            return true;
        } catch (IOException e) {
            log.error(e.getMessage());
            return false;
        }
    }

    private String getPyScriptExecCommand(String scriptName, String... parmas) {
        return "python3 " + getPythonScriptPath(scriptName) + " " + StringUtils.join(parmas, " ");
    }

    private boolean pdfExists(String pmid, String fileName) {
        String fileNameWithDirectory = pmid + "/" + fileName;
        Path pathToPdf = getPublicationPath(fileNameWithDirectory);
        return Files.exists(pathToPdf);
    }

    public boolean fetchArticlePdf(String pmid) throws IOException {
        Optional<Article> articleOptional = articleService.findByPmid(pmid);
        if (articleOptional.isEmpty()) {
            log.info("No article {}", pmid);
            return false;
        }
        Path path = getPublicationPath(pmid);

        // Create the PMID folder if it does not exist
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }
        Article article = articleOptional.get();
        boolean found = false;

        if (StringUtils.isNotEmpty(article.getPmcid())) {
            try {
                ProcessUtil.runScript("pip3 install bs4");
                ProcessUtil.runScript(getPyScriptExecCommand("PMC.py", article.getPmcid(), path.toAbsolutePath().toString()));
                found = pdfExists(pmid, article.getPmcid() + ".pdf");
            } catch (IOException e) {
                log.error("Failed with PMC retrieval: {}, continuing with DOI", e.getMessage());
            }
        }

        // If we cannot fetch the PDF through PubMed Central, we'd like to try doi link if user has access to the PDF file
        if (!found) {
            if (article.getDoi() == null) return false;
            String doiUrl = "https://www.doi.org/" + article.getDoi();
            String fileName = Math.abs(doiUrl.hashCode()) + ".pdf";
            String fileNameWithDirectory = pmid + "/" + fileName;
            Path pathToPdf = getPublicationPath(fileNameWithDirectory);
            try {
                ProcessUtil.runScript(getPyScriptExecCommand("doi.py", doiUrl, pathToPdf.toString()));
                found = pdfExists(pmid, fileName);
            } catch (IOException e) {
                log.error(e.getMessage());
                e.printStackTrace();
            }
        }
        if (!found) {
            log.info("Did not find PDF for article {}", pmid);
        }
        return found;
    }
}
