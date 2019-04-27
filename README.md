# Crackle

A template language akin to [Jinja][], [Twig][], [Liquid][], etc.

NOT (currently) intended for production!

_Work in progress_

## Usage

Install dependencies (Node.js 8.6+ required):

    npm install

The public API is still a work in progress. A cli is not (yet?) available, and
no constructor options are implemented. That said, much functionality is
present and can be used from a script or Node REPL:

```
const Crackle = require('./');
const env = new Crackle();

// Parse a template:
const ast = env.parse('{{ animal }}');

// Render a parsed template:
env.render(ast, { animal: 'toad' });

// Parse and render in a single step:
env.parseAndRender('{{ animal }}', { animal: 'toad' });
```

## Design Goals

- **Safe**: Since Crackle is intended to be user-facing, the primary goal is
  safety. Degenerate inputs, whether malicious or otherwise, should never be
  able to degrade the running service.
- **Familiar**: Syntax choices should look familiar for most programmers.

## Crackle Language

NOTE: None of the syntax or semantics are finalized. This is a playground to
try out various configurations.

### Synopsis

Crackle is made up of the following language constructs:

- Statements, denoted by `{%` and `%}` by default
- Expressions, denoted by `{{` and `}}` by default

Expressions output content, while statements are used for control flow.

### Literals

`"Hello world"`, `'Hello world'`

Strings are denoted with single or double quotes. A backslash can be used to
escape a quote character in a string. Strings can span multiple lines.

`1`, `3.14`

Ints and floats differ by the presense of a decimal point.

`true`, `false`, `null`

Boolean  literals and `null` are available for completeness, but usually aren't
used directly in templates.

Literals for arrays and objects are not available.

### Variables

Crackle supports the following data types:

- String
- Int
- Float (including NaN)
- Boolean
- Null
- Array
- Object

```
{{ myVariableName }}
```

### Operators

#### Math

TBD. Nothing yet available.

#### Comparisons

NOTE: All comparisons are non-strict. For example, `1 == true` resolves to
`true`.

- `==`
- `!=`
- `>`
- `<`
- `>=`
- `<=`

#### Logic

- `&&`
- `||`
- `!`
- `(grouped-expression)`

#### Other

- `|`: Apply a filter
- `.`: Member access, e.g., `author.name`

### Filters

Filters are value modifiers. They may be used in any expression.

```
{{ "hello world" | upcase }}
```

Available filters:

- `capitalize`: Capitalize the first letter of a string
- `date`: Accepts a format argument to format a date (or the string "now") using [strftime][] syntax
- `default`: Accepts a default value argument to fall back to for falsy values
- `downcase`: Lowercase all letters in a string
- `titlecase`: Titlecase a string
- `upcase`: Uppercase all letters in a string

### Whitespace Control

TBD. Currently no extra treatment is made, which may result in undesirable
whitespace. Trimming will be offered, but it is still undecided what should be
default behavior and what should be offered via syntax or filter(s).

### Escaping Content

TBD. Current thought is for HTML-escaping to be offered by default for
variables, and for literals to be considered escaped already. Intent is for this
behavior to be configurable (including non-html escape mechanisms). Filter(s)
may or may not be defined for escaping as well.

### Escaping Crackle

The only way to escape Crackle delimiters currently is to specify the
delimiters within expressions using string literals, i.e.,

```
This is an escaped delimiter: {{ "{{ }}" }}
```

Raw blocks may be defined in the future.

### Control Structures

#### For

Loop over arrays and strings:

```
<ul>
{% for tag in tags %}
    <li>{{ tag }}</li>
{% endfor %}
</ul>
```

Note that `for` loops are constrained for safety reasons (50 iterations by
default). Loops that hit the limit silently ignore the remaining items. This
behavior _may_ change in the future, but the intent is for strict and lax
variants to be offered. A global counter will eventually be implemented as
well, so that nested `for` loops cannot become problematic.

Loops will likely have a special loop context variable available in the future,
so that traits such as first-iteration, loop index, and so on can be
referenced. This is not yet defined.

#### If

Conditionally output content:

```
{% if score >= 90 %}
    A
{% elif score >= 80 && score < 90 %}
    B
{% elif score >= 70 && score < 80 %}
    C
{% elif score >= 60 && score < 70 %}
    D
{% else %}
    F
{% endif %}
```

## Why the name?

No good reason. I couldn't think of a good name and my daughter was eating a
[Crunch][] bar.

## License

MIT

[Jinja]: http://jinja.pocoo.org/
[Twig]: https://twig.symfony.com/
[Liquid]: https://shopify.github.io/liquid/
[Crunch]: https://en.wikipedia.org/wiki/Nestl%C3%A9_Crunch
[strftime]: http://man7.org/linux/man-pages/man3/strftime.3.html
