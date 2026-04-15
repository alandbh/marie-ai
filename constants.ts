import {
    buildCommonInstructionIntro,
    buildPromptContext,
    buildResponseFormatterPrompt,
    joinSections,
} from "./prompt/common";
import { buildFinanceInstruction, buildFinancePythonPrelude } from "./prompt/finance";
import { getProjectPromptExtension } from "./prompt/projects";
import { buildRetailInstruction, buildRetailPythonPrelude } from "./prompt/retail";
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

export const GET_PYTHON_PRELUDE = (project?: Project) => {
    const ctx = buildPromptContext(project);
    const projectExtension = getProjectPromptExtension(project);

    return ctx.projectType === "finance"
        ? buildFinancePythonPrelude(ctx, projectExtension)
        : buildRetailPythonPrelude(ctx);
};

export const RESPONSE_FORMATTER_PROMPT = buildResponseFormatterPrompt();
