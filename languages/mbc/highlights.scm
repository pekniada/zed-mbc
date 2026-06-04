; Declarations and outline-worthy names
(declaration_prefix
  [
    (declare_keyword)
    (public_keyword)
  ] @keyword)

(interface_keyword) @keyword
(modifier) @keyword
(field_keyword) @keyword
(variable_keyword) @keyword

(function_declaration
  kind: (function_keyword) @keyword
  name: (identifier) @function)

(statement_declaration
  kind: (statement_keyword) @keyword
  name: (identifier) @function)

(module_declaration
  kind: (module_keyword) @keyword
  name: (identifier) @type)

(type_declaration
  kind: (type_keyword) @keyword
  name: (identifier) @type)

(record_declaration
  kind: (record_keyword) @keyword
  name: (identifier) @type)

(record_keyword) @type.builtin

(field_declaration
  name: (variable) @variable.special)

(variable_declaration
  name: (variable) @variable.special)

(type_spec
  (record_keyword) @type.builtin
  (identifier) @type)

; Calls and member access
(function_call
  name: (identifier) @function)

(method_call
  receiver: (identifier) @variable
  method: (identifier) @function)

; Core tokens ported from the VS Code TextMate grammar
(keyword) @keyword
(type) @type.builtin
(constant) @constant.builtin
(variable) @variable.special
(operator) @operator
(number) @number
(string) @string
(escape_sequence) @string.escape

[
  (line_comment)
  (block_comment)
] @comment

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ","
  ";"
  ":"
  "."
] @punctuation.delimiter
