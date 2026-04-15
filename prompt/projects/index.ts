import { Project } from "../../projects-data";
import { PromptProjectExtension } from "../common";
import {
    buildFinance5PromptHint,
    getFinance5PromptExtension,
} from "./finance5";

export const getProjectPromptExtension = (
    project?: Project,
): PromptProjectExtension | undefined => {
    if (!project) {
        return undefined;
    }

    switch (project.slug) {
        case "finance5":
            return getFinance5PromptExtension();
        default:
            return undefined;
    }
};

export const buildProjectPromptHint = (
    project?: Project | null,
    userPrompt?: string,
) => {
    if (!project) {
        return "";
    }

    switch (project.slug) {
        case "finance5":
            return buildFinance5PromptHint(userPrompt);
        default:
            return "";
    }
};
