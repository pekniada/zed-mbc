; Declarations and outline-worthy names
(declaration_prefix
  [
    (declare_keyword)
    (public_keyword)
  ] @keyword)

(interface_keyword) @keyword
(modifier) @keyword.modifier
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
  name: (variable) @variable)

(variable_declaration
  name: (variable) @variable)

(type_spec
  (record_keyword) @type.builtin
  (identifier) @type)

; Calls and member access
(function_call
  name: (identifier) @function)

(method_call
  receiver: (identifier) @type
  method: (identifier) @function)

; MODULE.$Variable access.
; The grammar's method_call rule consumes the dot and leaves an (ERROR) node when
; it sees identifier.$variable instead of identifier.identifier. Match on that.
(source_file
  (bare_item (identifier) @type)
  .
  (ERROR)
  .
  (bare_item (variable))
  (#match? @type "^[A-Z][A-Z0-9_]*$"))

; Once grammar is updated with module_variable_access rule, this explicit pattern fires:
(module_variable_access
  module: (identifier) @type
  name: (variable) @variable)

; MBC statement/procedure calls use no parens: Name $arg1 Label $arg2 ...
; Highlight bare identifier immediately followed by a value token as a call/argument label.
(source_file
  (bare_item (identifier) @function)
  .
  (bare_item
    [
      (variable)
      (string)
      (number)
      (identifier)
      (keyword)
      (constant)
    ])
  (#match? @function ".*[a-z].*"))

; Core tokens ported from the VS Code TextMate grammar
(keyword) @keyword
(type) @type.builtin
(constant) @constant
(variable) @variable
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
