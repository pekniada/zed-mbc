const KEYWORDS = [
  "ALERTER",
  "ALTER",
  "APPEND",
  "ARGUMENT",
  "ARGUMENTCOUNT",
  "ARRAYDIM",
  "ARRAYSIZE",
  "AS",
  "BEGIN",
  "BLOCK",
  "BREAK",
  "CALL",
  "CASE",
  "CATCH",
  "CHECK_OCCURRENCES",
  "CLOSE",
  "CODE",
  "COMMIT",
  "COMPOSITE",
  "CONTAINER",
  "CONTINUE",
  "COPY",
  "CURRENTDATE",
  "DATABASE",
  "DBID",
  "DEBUG",
  "DELETE",
  "DETECT_UNPARSED_DATA",
  "ELSE",
  "END",
  "EXEC_SQL",
  "EXECUTE",
  "EXIT",
  "EXPAND",
  "EXPORT",
  "FAULT_TOLERANCE_LEVEL",
  "FIDENT",
  // NOTE: FIELD omitted — handled by dedicated field_keyword rule
  "FILE",
  "FILES",
  "FOLDERTYPE",
  "FOR",
  "FORMAT",
  "FROM",
  "GETDATE",
  "IF",
  "IMPORT",
  "IN",
  "INCLUDE",
  "INFO",
  "INPUT",
  "INSERT",
  "INTERP_VERSION",
  "INTO",
  "LOAD",
  "LOADPGM",
  "LOG",
  "LOG_NAME",
  "LOOP",
  "MAIN",
  "MAPOBJNAME",
  "MSINFO",
  "NOLOG",
  "ONCE",
  "OPEN",
  "OTHERS",
  "OUT",
  "OUTPUT",
  "PGMINFO",
  "PIPE",
  "PRAGMA",
  "PRINT",
  "PRINTERR",
  "PROGRAMINFO",
  "READ",
  "REGEXP",
  "REGISTER",
  "RELEASE",
  "REPEAT",
  "RETURN",
  "ROLLBACK",
  "SCAN",
  "SEGMENT",
  "SEGMENTGROUP",
  "SELECT",
  "SERIALIZE",
  "SETDATE",
  "SIDENT",
  "SLEEP",
  "SOURCEFILE",
  "SOURCELINE",
  "SOURCEMODULE",
  "SOURCEPROCEDURE",
  "SPLIT",
  "STRBACKWARD",
  "STRFORWARD",
  "STRLEN",
  "STRMID",
  "STRREPEAT",
  "SUBSTRING",
  "SUSPEND",
  "SWITCH",
  "SYSTEM",
  "THROW",
  "TO",
  "TRIMLEFT",
  "TRIMRIGHT",
  "TRY",
  "UNLOADPGM",
  "UNSERIALIZE",
  "UPDATE",
  "WHEN",
  "WHERE",
  "WHILE",
  "WITH",
  "WRITE",
];

const TYPES = [
  "CHAR",
  "CHARACTER",
  "DATE",
  "DOUBLE",
  "EXTENDER_FLOAT",
  "EXTENDER_FLOAT_VECTOR",
  "EXTENDER_INTEGER",
  "EXTENDER_INTEGER_VECTOR",
  "EXTENDER_STRING",
  "EXTENDER_STRING_VECTOR",
  "FLOAT",
  "FLOAT_VECTOR",
  "INTEGER",
  "INTEGER_VECTOR",
  "PRIMITIVE",
  "STRING",
  "STRING_VECTOR",
  "VOID",
];

const CONSTANTS = ["FALSE", "NULL", "TRUE"];

// NOTE: PUBLIC and INTERFACE omitted from MODIFIERS — both have dedicated structural
// keyword rules (public_keyword, interface_keyword) that handle them in declaration
// contexts. Including them here as anonymous tokens would cause conflicts.
const MODIFIERS = ["CONSTANT"];

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

const IDENT_START = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_".split("");
const IDENT_CONTINUE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_0123456789-".split("");
const VARIABLE_CONTINUE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_0123456789-".split("");
const DIGITS = "0123456789".split("");

function ci(value) {
  return seq(
    ...value.split("").map((char) => {
      if (/[a-z]/i.test(char)) {
        return choice(char.toLowerCase(), char.toUpperCase());
      }
      return char;
    }),
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
        $.field_declaration,
        $.variable_declaration,
        $.record_declaration,
        $.module_variable_access,
        $.method_call,
        $.function_call,
        $.bare_item,
      ),

    bare_item: ($) =>
      choice(
        $.variable,
        $.type,
        $.constant,
        $.modifier,
        $.keyword,
        $.operator,
        $.string,
        $.number,
        $.identifier,
        $.punctuation,
        $.unknown,
      ),

    function_declaration: ($) =>
      prec.right(
        2,
        seq(
          $.declaration_prefix,
          field("kind", $.function_keyword),
          field("name", $.identifier),
          optional($.parameter_list),
          optional($.return_type),
        ),
      ),

    statement_declaration: ($) =>
      prec.right(
        2,
        seq(
          $.declaration_prefix,
          field("kind", $.statement_keyword),
          field("name", $.identifier),
          optional($.parameter_list),
        ),
      ),

    module_declaration: ($) =>
      seq(
        $.declaration_prefix,
        field("kind", $.module_keyword),
        optional($.interface_keyword),
        field("name", $.identifier),
      ),

    type_declaration: ($) =>
      prec.right(
        1,
        seq(
          $.declaration_prefix,
          field("kind", $.type_keyword),
          field("name", $.identifier),
          optional($.record_keyword),
        ),
      ),

    record_declaration: ($) =>
      seq($.declaration_prefix, field("kind", $.record_keyword), field("name", $.identifier)),

    field_declaration: ($) =>
      prec.right(
        1,
        seq(
          $.declaration_prefix,
          $.field_keyword,
          field("name", $.variable),
          optional($.type_spec),
        ),
      ),

    variable_declaration: ($) =>
      prec.right(
        1,
        seq(
          $.declaration_prefix,
          optional($.variable_keyword),
          field("name", $.variable),
          optional($.type_spec),
        ),
      ),

    declaration_prefix: ($) => seq($.declare_keyword, optional($.public_keyword)),

    return_type: ($) => $.type_spec,

    type_spec: ($) => choice($.type, seq($.record_keyword, $.identifier)),

    parameter_list: ($) => seq("(", repeat($._parameter_item), ")"),

    _parameter_item: ($) =>
      choice(
        $.module_variable_access,
        $.method_call,
        $.function_call,
        $.type_spec,
        $.variable,
        $.modifier,
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

    // Handles MODULE.$variable — e.g. TIX_TRANSFER.$TIXTransferEntryType
    // Must be defined before method_call to win the prec.right(2) tie on `identifier .`
    module_variable_access: ($) =>
      prec(3, seq(field("module", $.identifier), ".", field("name", $.variable))),

    method_call: ($) =>
      prec.right(2, seq(field("receiver", $.identifier), ".", field("method", $.identifier), optional($.parameter_list))),

    declare_keyword: () => token(prec(5, ci("DECLARE"))),
    public_keyword: () => token(prec(5, ci("PUBLIC"))),
    interface_keyword: () => token(prec(5, ci("INTERFACE"))),
    field_keyword: () => token(prec(5, ci("FIELD"))),
    variable_keyword: () => token(prec(5, ci("VARIABLE"))),
    function_keyword: () => token(prec(4, ci("FUNCTION"))),
    statement_keyword: () => token(prec(4, ci("STATEMENT"))),
    module_keyword: () => token(prec(4, ci("MODULE"))),
    type_keyword: () => token(prec(4, ci("TYPE"))),
    record_keyword: () => token(prec(4, ci("RECORD"))),

    // Keyword, type, constant, modifier rules use plain string literals (anonymous tokens).
    // This lets tree-sitter's word/identifier extraction enforce word boundaries:
    // "InvalidServices" won't match "IN" because the full identifier text != "IN".
    // Structural keywords (declare_keyword, public_keyword etc.) keep token(prec()) for
    // case-insensitive matching inside declaration rules.
    modifier: ($) => choice(...MODIFIERS),
    keyword: ($) => choice(...KEYWORDS),
    type: ($) => choice(...TYPES),
    constant: ($) => choice(...CONSTANTS),
    operator: () => token(choice(...SYMBOL_OPERATORS, ciChoice(WORD_OPERATORS))),

    variable: () => token(seq("$", repeat(choice(...VARIABLE_CONTINUE)))),
    identifier: () => token(seq(choice(...IDENT_START), repeat(choice(...IDENT_CONTINUE)))),
    number: () =>
      token(seq(optional("-"), repeat1(choice(...DIGITS)), optional(seq(".", repeat(choice(...DIGITS)))))),

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
