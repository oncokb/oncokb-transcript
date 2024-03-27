package org.mskcc.oncokb.curation.util;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.mskcc.oncokb.curation.model.IntegerRange;

public class HotspotUtils {

    public static IntegerRange extractProteinPos(String proteinChange) {
        IntegerRange proteinPos = null;
        Integer start = -1;
        Integer end = -1;

        List<Integer> positions = extractPositiveIntegers(proteinChange);

        // ideally positions.size() should always be 2
        if (positions.size() >= 2) {
            start = positions.get(0);
            end = positions.get(positions.size() - 1);
        }
        // in case no end point, use start as end
        else if (!positions.isEmpty()) {
            start = end = positions.get(0);
        }

        if (!start.equals(-1)) {
            proteinPos = new IntegerRange();
            proteinPos.setStart(start);
            proteinPos.setEnd(end);
        }

        return proteinPos;
    }

    private static List<Integer> extractPositiveIntegers(String input) {
        if (input == null) {
            return Collections.emptyList();
        }

        List<Integer> list = new ArrayList<>();
        Pattern p = Pattern.compile("\\d+");
        Matcher m = p.matcher(input);

        while (m.find()) {
            list.add(Integer.parseInt(m.group()));
        }

        return list;
    }
}
