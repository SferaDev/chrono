import { ParsingContext } from "../../../chrono";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import * as references from "../../../common/casualReferences";
import { assignSimilarDate } from "../../../utils/dayjs";
import dayjs from "dayjs";
import { REGEX_PARTS } from "../constants";

const PATTERN = new RegExp(
    `(зараз|минулого\\s*вечора|минулої\\s*ночі|наступної\\s*ночі|сьогодні\\s*вночі|цієї\\s*ночі|цього ранку|вранці|ранку|зранку|опівдні|ввечері|вечора|опівночі|вночі)` +
        `${REGEX_PARTS.rightBoundary}`,
    REGEX_PARTS.flags
);
export default class UKCasualTimeParser extends AbstractParserWithWordBoundaryChecking {
    patternLeftBoundary(): string {
        return REGEX_PARTS.leftBoundary;
    }

    innerPattern() {
        return PATTERN;
    }

    innerExtract(context: ParsingContext, match: RegExpMatchArray) {
        let targetDate = dayjs(context.reference.instant);
        const lowerText = match[0].toLowerCase();
        const component = context.createParsingComponents();

        if (lowerText === "зараз") {
            return references.now(context.reference);
        }
        if (lowerText === "ввечері" || lowerText === "вечора") {
            return references.evening(context.reference);
        }
        if (lowerText.endsWith("вранці") || lowerText.endsWith("ранку") || lowerText.endsWith("зранку")) {
            return references.morning(context.reference);
        }
        if (lowerText.endsWith("опівдні")) {
            return references.noon(context.reference);
        }
        if (lowerText.match(/минулої\s*ночі/)) {
            return references.lastNight(context.reference);
        }
        if (lowerText.match(/минулого\s*вечора/)) {
            return references.yesterdayEvening(context.reference);
        }
        if (lowerText.match(/наступної\s*ночі/)) {
            const daysToAdd = targetDate.hour() < 22 ? 1 : 2;
            targetDate = targetDate.add(daysToAdd, "day");
            assignSimilarDate(component, targetDate);
            component.imply("hour", 1);
        }
        if (lowerText.match(/цієї\s*ночі/)) {
            return references.midnight(context.reference);
        }
        if (lowerText.endsWith("опівночі") || lowerText.endsWith("вночі")) {
            return references.midnight(context.reference);
        }
        return component;
    }
}
