const KEYWORDS = [
  "ALERTER",
  "AND",
  "ARGUMENT",
  "ARGUMENTCOUNT",
  "BREAK",
  "CALL",
  "CASE",
  "CATCH",
  "CHECK_OCCURRENCES",
  "CLOSE",
  "CONTAINER",
  "DATABASE",
  "DEBUG",
  "DECLARE",
  "DETECT_UNPARSED_DATA",
  "ELSE",
  "END",
  "EXEC_SQL",
  "EXECUTE",
  "EXIT",
  "EXPORT",
  "FAULT_TOLERANCE_LEVEL",
  "FIELD",
  "FILE",
  "FILES",
  "FOLDERTYPE",
  "FOR",
  "IF",
  "IMPORT",
  "IN",
  "INCLUDE",
  "INFO",
  "INPUT",
  "INTERFACE",
  "INTO",
  "LOAD",
  "LOADPGM",
  "LOG",
  "LOG_NAME",
  "LOOP",
  "MAPOBJNAME",
  "MSINFO",
  "NOLOG",
  "ONCE",
  "OPEN",
  "OR",
  "OTHERS",
  "OUT",
  "OUTPUT",
  "PRINT",
  "PRINTERR",
  "PUBLIC",
  "READ",
  "REGISTER",
  "RELEASE",
  "RETURN",
  "SERIALIZE",
  "SLEEP",
  "SOCKET.ACCEPT",
  "SOCKET.GET",
  "SOCKET.NGET",
  "SOCKET.NPUT",
  "SOCKET.PUT",
  "SUSPEND",
  "SWITCH",
  "THROW",
  "TO",
  "TRY",
  "UNLOADPGM",
  "UNSERIALIZE",
  "WHEN",
  "WHILE",
  "XOR",
];

const TYPES = [
  "CHAR",
  "CONSTANT",
  "DATE",
  "EXTENDER_FLOAT",
  "EXTENDER_FLOAT_VECTOR",
  "EXTENDER_INTEGER",
  "EXTENDER_INTEGER_VECTOR",
  "EXTENDER_STRING",
  "EXTENDER_STRING_VECTOR",
  "FLOAT_VECTOR",
  "INTEGER",
  "INTEGER_VECTOR",
  "PRIMITIVE",
  "STRING",
  "STRING_VECTOR",
  "VOID",
];

const CONSTANTS = ["FALSE", "NULL", "TRUE"];

const WORD_OPERATORS = [
  "AND",
  "BAND",
  "BNOT",
  "BOR",
  "BSHIFT",
  "BXOR",
  "NOT",
  "OR",
  "XOR",
];

const SYMBOL_OPERATORS = [
  "<>",
  "<=",
  ">=",
  "+",
  "-",
  "*",
  "/",
  "%",
  "=",
  "<",
  ">",
  "|",
  "&",
];

function ci(value) {
  return new RegExp(
    value
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .split("")
      .map((char) => {
        if (/[a-z]/i.test(char)) {
          return `[${char.toLowerCase()}${char.toUpperCase()}]`;
        }
        return char;
      })
      .join(""),
  );
}

function ciChoice(words) {
  return choice(...words.sort((a, b) => b.length - a.length).map(ci));
}

module.exports = grammar({
  name: "mbc",

  word: ($) => $.identifier,

  extras: ($) => [/\s/, $.line_comment, $.block_comment],

  rules: {
    source_file: ($) => repeat($._item),

    _item: ($) =>
      choice(
        $.function_declaration,
        $.statement_declaration,
        $.module_declaration,
        $.type_declaration,
        $.record_declaration,
        $.method_call,
        $.function_call,
        $.bare_item,
      ),

    bare_item: ($) =>
      seq(
        choice(
        $.variable,
        $.type,
        $.constant,
        $.keyword,
        $.operator,
        $.string,
        $.number,
        $.identifier,
        $.punctuation,
        $.unknown,
        ),
      ),

    function_declaration: ($) =>
      prec.right(2, seq(field("kind", $.function_keyword), field("name", $.identifier), optional($.parameter_list))),

    statement_declaration: ($) =>
      prec.right(2, seq(field("kind", $.statement_keyword), field("name", $.identifier), optional($.parameter_list))),

    module_declaration: ($) => seq(field("kind", $.module_keyword), field("name", $.identifier)),

    type_declaration: ($) =>
      prec.right(1, seq(field("kind", $.type_keyword), field("name", $.identifier), optional($.record_keyword))),

    record_declaration: ($) => seq(field("kind", $.record_keyword), field("name", $.identifier)),

    parameter_list: ($) => seq("(", repeat($._parameter_item), ")"),

    _parameter_item: ($) =>
      choice(
        $.method_call,
        $.function_call,
        $.variable,
        $.type,
        $.constant,
        $.keyword,
        $.operator,
        $.string,
        $.number,
        $.identifier,
        $.parameter_list,
        $.punctuation_without_parens,
        $.unknown,
      ),

    function_call: ($) => prec(2, seq(field("name", $.identifier), $.parameter_list)),

    method_call: ($) =>
      prec.right(2, seq(field("receiver", $.identifier), ".", field("method", $.identifier), optional($.parameter_list))),

    function_keyword: () => token(prec(4, ci("FUNCTION"))),
    statement_keyword: () => token(prec(4, ci("STATEMENT"))),
    module_keyword: () => token(prec(4, ci("MODULE"))),
    type_keyword: () => token(prec(4, ci("TYPE"))),
    record_keyword: () => token(prec(4, ci("RECORD"))),

    keyword: () => token(prec(2, ciChoice(KEYWORDS))),
    type: () => token(prec(3, ciChoice(TYPES))),
    constant: () => token(prec(3, ciChoice(CONSTANTS))),
    operator: () => token(choice(...SYMBOL_OPERATORS, ciChoice(WORD_OPERATORS))),

    variable: () => token(seq("$", /[A-Za-z0-9_-]*/)),
    identifier: () => /[A-Za-z_][A-Za-z0-9_-]*/,
    number: () => token(seq(optional("-"), /\d+/, optional(seq(".", /\d*/)))),

    string: ($) =>
      seq(
        '"',
        repeat(choice($.escape_sequence, token.immediate(prec(1, /[^"\\]+/)))),
        '"',
      ),

    escape_sequence: () => token.immediate(seq("\\", /./)),

    line_comment: () => token(seq("#", /.*/)),

    block_comment: () => token(seq("/*", repeat(choice(/[^*]/, /\*[^/]/)), optional("*/"))),

    punctuation: () => choice("{", "}", "[", "]", "(", ")", ";", ",", ":", "."),
    punctuation_without_parens: () => choice("{", "}", "[", "]", ";", ",", ":", "."),
    unknown: () => token(/./),
  },
});
