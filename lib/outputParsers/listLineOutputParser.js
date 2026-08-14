import { BaseOutputParser } from "@langchain/core/output_parsers";

class ListLineOutputParser extends BaseOutputParser {
  constructor(args) {
    super();
    this.key = args?.key ?? "suggestions";
  }

  static lc_name() {
    return "ListLineOutputParser";
  }

  lc_namespace = ["langchain", "output_parsers", "list_line_output_parser"];

  async parse(text) {
    const regex = new RegExp(`<${this.key}>([\\s\\S]*?)<\\/${this.key}>`);
    const match = text.match(regex);
    if (!match) return [];
    return match[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  getFormatInstructions() {
    return `Wrap your list in <${this.key}></${this.key}> tags, one item per line.`;
  }
}

export default ListLineOutputParser;