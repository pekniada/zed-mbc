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

const MODIFIERS = ["PUBLIC", "INTERFACE"];

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
          $.modifier,
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

    modifier: () => token(prec(3, ciChoice(MODIFIERS))),
    keyword: () => token(prec(2, ciChoice(KEYWORDS))),
    type: () => token(prec(3, ciChoice(TYPES))),
    constant: () => token(prec(3, ciChoice(CONSTANTS))),
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
