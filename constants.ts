import {
    buildCommonInstructionIntro,
    buildPromptContext,
    buildResponseFormatterPrompt,
    joinSections,
} from "./prompt/common";
import { buildFinanceInstruction } from "./prompt/finance";
import { getProjectPromptExtension } from "./prompt/projects";
import { buildRetailInstruction } from "./prompt/retail";
import { Project } from "./projects-data";

export const GET_INITIAL_SYSTEM_INSTRUCTION = (project?: Project) => {
    const ctx = buildPromptContext(project);
    const projectExtension = getProjectPromptExtension(project);
    const profileInstruction =
        ctx.projectType === "finance"
            ? buildFinanceInstruction(ctx, projectExtension)
            : buildRetailInstruction(ctx);

    return joinSections(buildCommonInstructionIntro(), profileInstruction);
};

export const RESPONSE_FORMATTER_PROMPT = buildResponseFormatterPrompt();
