const Crackle = require('../')

function App (opts) {
  const crackle = new Crackle()
  const state = {
    template: opts.template,
    contextText: JSON.stringify(opts.context, null, 2),
    contextData: opts.context
  }
  const ui = {
    template: document.getElementById('template'),
    context: document.getElementById('context'),
    tidy: document.querySelector('[data-action="tidy"]'),
    output: document.querySelector('.output__text')
  }

  const update = ({ context, template }) => {
    let renderTemplate = !!template;
    if (context) {
      ui.tidy.removeAttribute('disabled')
      try {
        state.contextData = JSON.parse(state.contextText)
        state.contextError = ''
        renderTemplate = true
      } catch (e) {
        state.contextError = e.message
        ui.tidy.disabled = true
      }
    }

    if (template) {
      try {
        state.templateAst = crackle.parse(state.template)
        state.templateError = ''
      } catch (e) {
        state.templateError = e.message
      }
    }

    if (renderTemplate) {
      try {
        state.output = crackle.render(state.templateAst, state.contextData)
        state.renderError = ''
      } catch (e) {
        state.renderError = e.message
      }
    }

    const errorMsg = state.templateError || state.contextError || state.renderError
    if (errorMsg) {
      ui.output.textContent = errorMsg
      ui.output.classList.add('invalid')
    } else {
      ui.output.textContent = state.output
      ui.output.classList.remove('invalid')
    }
  };

  ui.template.addEventListener('input', (e) => {
    state.template = e.target.value
    update({ template: true })
  })

  ui.context.addEventListener('input', (e) => {
    state.contextText = e.target.value
    update({ context: true })
  })

  ui.tidy.addEventListener('click', () => {
    state.contextText = JSON.stringify(state.contextData, null, 2)
    ui.context.value = state.contextText
  })

  ui.template.value = state.template
  ui.context.value = state.contextText
  update({ template: true, context: true })
}

const template = `
About Crackle:

Expressions, denoted by {{ '{{' }} and {{ '}}' }}, can be used to output content:
Page title: {{ page.title }}

Tags are used for flow control and are denoted with {{ '{%' }} and {{ '%}' }}.

Conditional tags:
{% if page %}
    {{ page.title }}
{% endif %}

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

Iteration tags:

{% for animal in animals %}
    {{ animal }}
{% endfor %}

Expressions can be passed through filters to alter their output:
{{ "hello world" | upcase }}

Filters can be used for other text generation as well:
Hello, {{ null | default: "friend" }}!
Today is {{ "now" | date: "%a, %b %d, %Y" }}
`.trim()

const context = {
  page: {
    title: 'Try Crackle'
  },
  score: 99,
  animals: ['panda', 'squirrel', 'toad']
}

App({ template, context })
