package org.mskcc.oncokb.curation.importer;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.service.ArticleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.w3c.dom.*;
import org.xml.sax.SAXException;

// TODO: The code is subjected to further review/refactoring. It comes from AI/ML team, developed by Luke Czapla.

@Component
public class XMLParser {

    private static final Logger log = LoggerFactory.getLogger(XMLParser.class);

    public static int count = 0, dupCount = 0;

    private Node root;
    //private Document document;
    private final List<Article> stack = new ArrayList<>();
    private Set<Integer> articleMap = new HashSet<>();

    private ArticleService articleService;

    public XMLParser(ArticleService articleService) {
        this.articleService = articleService;
    }

    public void reload(String file) throws IOException, SAXException, ParserConfigurationException {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            //factory.setFeature("http://apache.org/xml/features/nonvalidating/load-dtd-grammar", false);
            //factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);

            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(new File(file));
            document.getDocumentElement().normalize();
            root = document.getDocumentElement();
            log.info("Read XML with head node {}", root.getNodeName());
        } catch (ParserConfigurationException | SAXException | IOException e) {
            //e.printStackTrace();
            log.error("Error occurred in reload");
            log.error(e.getMessage());
            throw e;
        }
    }

    public void merge(Object obj, Object update) {
        if (!obj.getClass().isAssignableFrom(update.getClass())) {
            return;
        }

        Method[] methods = obj.getClass().getMethods();

        for (Method fromMethod : methods) {
            if (fromMethod.getDeclaringClass().equals(obj.getClass()) && fromMethod.getName().startsWith("get")) {
                String fromName = fromMethod.getName();
                String toName = fromName.replace("get", "set");

                try {
                    Method toMethod = obj.getClass().getMethod(toName, fromMethod.getReturnType());
                    Object value = fromMethod.invoke(update, null);
                    if (value != null) {
                        toMethod.invoke(obj, value);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public void visitChildNodes(NodeList nList) {
        for (int temp = 0; temp < nList.getLength(); temp++) {
            Node node = nList.item(temp);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                System.out.println("Node Name = " + node.getNodeName() + "; Value = " + node.getTextContent());
                //Check all attributes
                if (node.hasAttributes()) {
                    // get attributes names and values
                    NamedNodeMap nodeMap = node.getAttributes();
                    for (int i = 0; i < nodeMap.getLength(); i++) {
                        Node tempNode = nodeMap.item(i);
                        System.out.println("Attr name : " + tempNode.getNodeName() + "; Value = " + tempNode.getNodeValue());
                    }
                }
                if (node.hasChildNodes()) {
                    //We got more children; Let's visit them as well
                    visitChildNodes(node.getChildNodes());
                }
            }
        }
    }

    public void DFS(Node start, String append) {
        if (start.hasChildNodes()) {
            NodeList nl = start.getChildNodes();
            for (int i = 0; i < nl.getLength(); i++) {
                System.out.print(append);
                System.out.print(nl.item(i).getNodeName());
                if (nl.item(i).getAttributes() != null) {
                    for (int j = 0; j < nl.item(i).getAttributes().getLength(); j++) {
                        System.out.print(
                            ", node " +
                            j +
                            ": key=" +
                            nl.item(i).getAttributes().item(j).getNodeName() +
                            " .value=" +
                            nl.item(i).getAttributes().item(j).getNodeValue() +
                            "..."
                        );
                    }
                }
                System.out.println(" " + nl.item(i).getTextContent());
                DFS(nl.item(i), append + "\t");
            }
        }
    }

    public void DFS(Node start, List<Tree> items, Article article) throws NoSuchFieldException, IllegalAccessException {
        String date = null;
        if (start.hasChildNodes()) {
            NodeList nl = start.getChildNodes();
            for (int i = 0; i < nl.getLength(); i++) {
                //System.out.print(append);
                for (Tree t : items) {
                    if (t.getName().equals(nl.item(i).getNodeName())) {
                        if (t.getAttributes() != null) {
                            if (nl.item(i).getAttributes() == null) continue;
                            List<Boolean> found = new ArrayList<>();
                            for (int k = 0; k < t.getAttributes().size(); k++) {
                                found.add(false);
                            }

                            for (int j = 0; j < nl.item(i).getAttributes().getLength(); j++) {
                                for (int k = 0; k < t.getAttributes().size(); k++) {
                                    if (
                                        t.getAttributes().get(k).key.equals(nl.item(i).getAttributes().item(j).getNodeName()) &&
                                        t.getAttributes().get(k).value.equals(nl.item(i).getAttributes().item(j).getNodeValue())
                                    ) found.set(k, true);
                                }
                            }
                            if (found.stream().anyMatch(b -> !b)) continue;
                        }
                        if (t.getToken() != null) {
                            boolean found = false;
                            for (int j = 0; j < nl.item(i).getAttributes().getLength(); j++) {
                                if (
                                    t.getToken().key.equals(nl.item(i).getAttributes().item(j).getNodeName()) &&
                                    t.getToken().value.equals(nl.item(i).getAttributes().item(j).getNodeValue())
                                ) found = true;
                            }
                            if (!found) continue;
                        }
                        if (t.getAsField() != null) {
                            Field f = null;
                            String s = null;
                            //boolean labelled = false;
                            if (t.getDate() == null) {
                                date = null;

                                f = article.getClass().getDeclaredField(t.getAsField());
                                f.setAccessible(true);
                                s = (String) f.get(article);

                                if (s != null && t.getAppend() != null) s += t.getAppend();
                                boolean isnull = s == null;
                                if (t.getWithLabel() != null) {
                                    for (int j = 0; j < nl.item(i).getAttributes().getLength(); j++) {
                                        if (nl.item(i).getAttributes().item(j).getNodeName().equals(t.getWithLabel())) {
                                            if (s == null) {
                                                s = nl.item(i).getAttributes().item(j).getNodeValue() + ":";
                                                isnull = false;
                                            } else s += nl.item(i).getAttributes().item(j).getNodeValue() + ":";
                                            //labelled = true;
                                        }
                                    }
                                }
                                if (t.getWithLabel2() != null) {
                                    for (int j = 0; j < nl.item(i).getAttributes().getLength(); j++) {
                                        if (nl.item(i).getAttributes().item(j).getNodeName().equals(t.getWithLabel2())) {
                                            if (s == null) {
                                                s = nl.item(i).getAttributes().item(j).getNodeValue() + ":";
                                                isnull = false;
                                            } else s += nl.item(i).getAttributes().item(j).getNodeValue() + ":";
                                            //labelled = true;
                                        }
                                    }
                                }
                                //if (labelled) s += ":";
                                if (isnull) s = nl.item(i).getTextContent(); else s += nl.item(i).getTextContent();
                                f.set(article, s);
                            } else {
                                if (date == null) {
                                    date = nl.item(i).getTextContent();
                                } else {
                                    date += "/" + nl.item(i).getTextContent();
                                    if (t.getAsField().equals("pubDate")) {
                                        f = article.getClass().getDeclaredField(t.getAsField());
                                        f.setAccessible(true);

                                        f.set(article, parseDate(date));
                                        date = null;
                                    }
                                }
                                if (date != null && date.length() >= 8) {
                                    f = article.getClass().getDeclaredField(t.getAsField());
                                    f.setAccessible(true);

                                    f.set(article, parseDate(date));
                                    date = null;
                                }
                            }
                        }
                        //System.out.println(" " + nl.item(i).getTextContent());
                        if (t.getSaveItemAfter() != null) {
                            // push
                            if (article != null) stack.add(article);
                            article = new Article();
                        }
                        if (t.getChildren() != null) DFS(nl.item(i), t.getChildren(), article);
                        if (t.getSaveItemAfter() != null) {
                            //System.out.println("SAVE ITEM HERE");
                            final String pmId = article.getPmid();
                            if (pmId != null) {
                                Article a;
                                if (articleMap.contains(Integer.parseInt(pmId))) {
                                    Optional<Article> optionalArticle = articleService.findByPmid(pmId);
                                    if (optionalArticle.isPresent()) {
                                        a = optionalArticle.get();
                                        dupCount++;
                                        merge(article, a);
                                        articleService.save(a);
                                    }
                                }
                                if (article.getPmid() != null) {
                                    try {
                                        Article savedArticle;
                                        Optional<Article> articleOptional = articleService.findByPmid(article.getPmid());
                                        if (articleOptional.isEmpty()) {
                                            savedArticle = articleService.save(article);
                                        } else {
                                            article.setId(articleOptional.get().getId());
                                            savedArticle = articleService.partialUpdate(article).get();
                                        }
                                        articleMap.add(Integer.parseInt(savedArticle.getPmid()));
                                        synchronized (log) {
                                            articleMap.add(Integer.parseInt(savedArticle.getPmid()));
                                        }
                                    } catch (Exception e) {
                                        log.info(e.getMessage());
                                        dupCount++;
                                    }
                                    count++;
                                }
                                //if (article.getCitation() == null) System.out.println(article.toString());
                                // pop
                            }
                            if (stack.size() > 0) article = stack.remove(stack.size() - 1);
                        }
                    }
                }
            }
        }
    }

    public void DFSFast(Node start, List<Tree> items, Article article) throws NoSuchFieldException, IllegalAccessException {
        String date = null;
        if (start.hasChildNodes()) {
            NodeList nl = start.getChildNodes();
            for (int i = 0; i < nl.getLength(); i++) {
                for (Tree t : items) {
                    if (t.getName().equals(nl.item(i).getNodeName())) {
                        if (t.getAttributes() != null) {
                            if (nl.item(i).getAttributes() == null) continue;
                            List<Boolean> found = new ArrayList<>();
                            for (int k = 0; k < t.getAttributes().size(); k++) {
                                found.add(false);
                            }

                            for (int j = 0; j < nl.item(i).getAttributes().getLength(); j++) {
                                for (int k = 0; k < t.getAttributes().size(); k++) {
                                    if (
                                        t.getAttributes().get(k).key.equals(nl.item(i).getAttributes().item(j).getNodeName()) &&
                                        t.getAttributes().get(k).value.equals(nl.item(i).getAttributes().item(j).getNodeValue())
                                    ) found.set(k, true);
                                }
                            }
                            if (found.stream().anyMatch(b -> !b)) continue;
                        }
                        if (t.getToken() != null) {
                            boolean found = false;
                            for (int j = 0; j < nl.item(i).getAttributes().getLength(); j++) {
                                if (
                                    t.getToken().key.equals(nl.item(i).getAttributes().item(j).getNodeName()) &&
                                    t.getToken().value.equals(nl.item(i).getAttributes().item(j).getNodeValue())
                                ) found = true;
                            }
                            if (!found) continue;
                        }
                        if (t.getAsField() != null) {
                            Field f = null;
                            String s = null;
                            //boolean labelled = false;
                            if (t.getDate() == null) {
                                date = null;
                                f = article.getClass().getDeclaredField(t.getAsField());
                                f.setAccessible(true);
                                s = (String) f.get(article);

                                if (s != null && t.getAppend() != null) s += t.getAppend();
                                boolean isnull = s == null;
                                if (t.getWithLabel() != null) {
                                    for (int j = 0; j < nl.item(i).getAttributes().getLength(); j++) {
                                        if (nl.item(i).getAttributes().item(j).getNodeName().equals(t.getWithLabel())) {
                                            if (s == null) {
                                                s = nl.item(i).getAttributes().item(j).getNodeValue() + ":";
                                                isnull = false;
                                            } else s += nl.item(i).getAttributes().item(j).getNodeValue() + ":";
                                            //labelled = true;
                                        }
                                    }
                                }
                                if (t.getWithLabel2() != null) {
                                    for (int j = 0; j < nl.item(i).getAttributes().getLength(); j++) {
                                        if (nl.item(i).getAttributes().item(j).getNodeName().equals(t.getWithLabel2())) {
                                            if (s == null) {
                                                s = nl.item(i).getAttributes().item(j).getNodeValue() + ":";
                                                isnull = false;
                                            } else s += nl.item(i).getAttributes().item(j).getNodeValue() + ":";
                                            //labelled = true;
                                        }
                                    }
                                }
                                //if (labelled) s += ":";
                                if (isnull) s = nl.item(i).getTextContent(); else s += nl.item(i).getTextContent();
                                f.set(article, s);
                            } else {
                                if (date == null) {
                                    date = nl.item(i).getTextContent();
                                } else {
                                    date += "/" + nl.item(i).getTextContent();
                                    if (t.getAsField().equals("pubDate")) {
                                        f = article.getClass().getDeclaredField(t.getAsField());
                                        f.setAccessible(true);

                                        f.set(article, parseDate(date));
                                        date = null;
                                    }
                                }
                                if (date != null && date.length() >= 8) {
                                    f = article.getClass().getDeclaredField(t.getAsField());
                                    f.setAccessible(true);

                                    f.set(article, parseDate(date));
                                    date = null;
                                }
                            }
                        }
                        //System.out.println(" " + nl.item(i).getTextContent());
                        if (t.getSaveItemAfter() != null) {
                            // push
                            if (article != null) stack.add(article);
                            article = new Article();
                        }
                        if (t.getChildren() != null) DFSFast(nl.item(i), t.getChildren(), article);
                        if (t.getSaveItemAfter() != null) {
                            //System.out.println("SAVE ITEM HERE");
                            final String pmId = article.getPmid();
                            if (pmId != null) {
                                /*This goes away in the DFSFast method to not waste MongoDB calls.
                                Article a = null;
                                if (articleMap.contains(Integer.parseInt(pmId))) {
                                    a = articleService.findByPmid(pmId);
                                    dupCount++;
                                    merge(article, a);
                                }
                                end section that went away before*/
                                boolean bad = false;
                                int pmIdInt = -1;
                                try {
                                    pmIdInt = Integer.parseInt(pmId);
                                    // had gone away, now back in DFSfast
                                    Article a = null;
                                    if (articleMap.contains(pmIdInt)) {
                                        Optional<Article> optionalArticle = articleService.findByPmid(pmId);
                                        if (optionalArticle.isPresent()) {
                                            dupCount++;
                                            merge(article, a);
                                        }
                                        //articleService.save(a);
                                    }
                                    // end section that was removed
                                } catch (NumberFormatException e) {
                                    bad = true;
                                }
                                if (!bad && !articleMap.contains(pmIdInt)) {
                                    try {
                                        Article savedArticle;
                                        Optional<Article> articleOptional = articleService.findByPmid(article.getPmid());
                                        if (articleOptional.isEmpty()) {
                                            savedArticle = articleService.save(article);
                                        } else {
                                            article.setId(articleOptional.get().getId());
                                            savedArticle = articleService.partialUpdate(article).get();
                                        }
                                        articleMap.add(Integer.parseInt(savedArticle.getPmid()));
                                        count++;
                                    } catch (Exception e) {
                                        dupCount++;
                                        log.error("Possible duplicate article with PMID {} and error {}", pmId, e.getMessage());
                                    }
                                }
                                //if (article.getCitation() == null) System.out.println(article.toString());
                                // pop
                            }
                            if (stack.size() > 0) article = stack.remove(stack.size() - 1);
                        }
                    }
                }
            }
        }
    }

    private Instant parseDate(String date) {
        Instant instant;
        try {
            instant =
                YearMonth.parse(date, DateTimeFormatter.ofPattern("yyyy/MM")).atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        } catch (IllegalArgumentException | DateTimeParseException e) {
            instant =
                YearMonth.parse(date, DateTimeFormatter.ofPattern("yyyy/MMM")).atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        }
        return instant;
    }

    public Node getRoot() {
        return root;
    }

    public void setArticleService(ArticleService articleService) {
        this.articleService = articleService;
    }

    public void setDb(List<Article> db) {
        for (Article article : db) {
            articleMap.add(Integer.parseInt(article.getPmid()));
        }
    }

    public Set<Integer> getDb() {
        return articleMap;
    }

    public void clearDb() {
        articleMap = new HashSet<>();
    }
}
