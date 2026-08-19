import remarkFrontmatter from "remark-frontmatter";
import remarkMdx from "remark-mdx";
import remarkPresetLintRecommended from "remark-preset-lint-recommended";
import remarkValidateLinks from "remark-validate-links";

export default {
  plugins: [
    remarkFrontmatter,
    remarkMdx,
    remarkPresetLintRecommended,
    remarkValidateLinks,
  ],
};
